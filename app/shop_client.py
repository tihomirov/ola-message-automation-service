"""Client for the shop admin's internal JSON endpoints.

The admin has no public API, so we replay the requests its own UI makes:

    POST <site>/eco/ukr/main/signin               {"email","password","rememberme"} -> session cookie
    POST <base>/orders/getjson                    {"#":null,"query":"<number>"}      -> order list (number -> ID)
    POST <base>/orders/getorderjson               {"#":null,"id":<ID>,"query":null}  -> full order

Auth
    * If login credentials are configured, the client logs in by itself and,
      when the session expires, logs in again once and retries (throttled, so a
      wrong password never turns into a login loop).
    * A Cookie header pasted from DevTools is the fallback / starting point.
    CORS does not apply here: it is a browser rule, this is a plain HTTP client.

Every call returns one of these states:
    OK               -> data parsed
    SESSION_EXPIRED  -> not authenticated (and re-login was impossible/failed)
    NOT_FOUND        -> authenticated, but no such order
    ERROR            -> network problem / unexpected response
"""

from __future__ import annotations

import enum
import json
import re
import time
from dataclasses import dataclass, field
from typing import Callable
from urllib.parse import quote

import httpx

SIZE_RE = re.compile(r"Розмір\s*:\s*([^,]+)", re.IGNORECASE)
COLOR_RE = re.compile(r"Колір\s*:\s*([^,]+)", re.IGNORECASE)


class FetchStatus(str, enum.Enum):
    OK = "ok"
    SESSION_EXPIRED = "session_expired"
    NOT_FOUND = "not_found"
    ERROR = "error"


class LoginStatus(str, enum.Enum):
    OK = "ok"
    BAD_CREDENTIALS = "bad_credentials"
    NOT_CONFIGURED = "not_configured"
    THROTTLED = "throttled"
    ERROR = "error"


@dataclass
class OrderItem:
    name: str
    size: str | None
    color: str | None
    count: int
    price: str  # as shown by the shop, e.g. "2920,00"
    modification: str


@dataclass
class OrderDetails:
    id: int
    number: str
    customer_name: str
    phone: str | None
    email: str | None
    total: str
    currency: str
    delivery: str | None
    delivery_address: str | None
    comment: str | None
    items: list[OrderItem] = field(default_factory=list)


@dataclass
class OrderSummary:
    """One row of the admin's order list (orders/getjson)."""

    id: int
    number: str
    client: str
    status: str | None
    delivery: str | None
    payment: str | None
    final_price: str | None
    date: str | None


@dataclass
class FetchResult:
    status: FetchStatus
    order: OrderDetails | None = None
    detail: str = ""
    summary: OrderSummary | None = None


@dataclass
class LoginResult:
    status: LoginStatus
    detail: str = ""
    cookie_names: list[str] = field(default_factory=list)


@dataclass
class ShopConfig:
    base_url: str  # e.g. https://forreal-wear.com/eco/ukr/shop
    cookie: str = ""  # optional "Cookie" header value copied from DevTools (fallback)
    login_email: str = ""
    login_password: str = ""
    signin_url: str = ""  # default: derived from base_url (.../shop -> .../main/signin)
    timeout: float = 15.0
    min_relogin_interval: float = 60.0  # seconds between automatic login attempts
    user_agent: str = (
        "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
    )

    def resolved_signin_url(self) -> str:
        if self.signin_url:
            return self.signin_url
        base = self.base_url.rstrip("/")
        if base.endswith("/shop"):
            return base[: -len("/shop")] + "/main/signin"
        raise ValueError("signin_url must be set when base_url does not end with /shop")


# ------------------------------------------------------------------ parsing
def _extract(regex: re.Pattern, text: str) -> str | None:
    m = regex.search(text or "")
    return m.group(1).strip() if m else None


def _norm_number(number: str) -> str:
    return (number or "").strip().lstrip("№#").strip().upper()


def parse_order(model: dict) -> OrderDetails:
    delivery = model.get("Delivery") or {}
    addr = delivery.get("PickupAddressFull") or delivery.get("DeliveryAddressFull") or {}
    items = []
    for p in model.get("Products") or []:
        mod = p.get("ModificationName") or ""
        items.append(
            OrderItem(
                name=(p.get("Name") or "").strip(),
                size=_extract(SIZE_RE, mod),
                color=_extract(COLOR_RE, mod),
                count=int(p.get("Count") or 1),
                price=str(p.get("FinalCost") or p.get("FinalPriceFormat") or ""),
                modification=mod,
            )
        )
    return OrderDetails(
        id=int(model["ID"]),
        number=str(model.get("OrderNumber") or ""),
        customer_name=(model.get("UserName") or "").strip(),
        phone=model.get("UserPhone") or addr.get("PhoneNumber"),
        email=model.get("UserEmail"),
        total=str(model.get("TotalAmount") or ""),
        currency=model.get("CurrencyCode") or "₴",
        delivery=delivery.get("Name"),
        delivery_address=addr.get("Address") or delivery.get("Address") or None,
        comment=model.get("UserComments"),
        items=items,
    )


def parse_summary(row: dict) -> OrderSummary:
    return OrderSummary(
        id=int(row["ID"]),
        number=str(row.get("OrderNumber") or ""),
        client=(row.get("Client") or "").strip(),
        status=row.get("Status"),
        delivery=row.get("Delivery"),
        payment=row.get("PaymentName"),
        final_price=row.get("FinalPrice"),
        date=row.get("Date"),
    )


def _check_envelope(resp: httpx.Response) -> tuple[FetchResult | None, dict | None]:
    """Common checks for the admin's JSON envelope {"type","result","redirect"}.

    Returns (failure, None) or (None, data) when type == "success".
    """
    if resp.status_code in (301, 302, 303, 307, 308, 401, 403):
        return FetchResult(FetchStatus.SESSION_EXPIRED, detail=f"HTTP {resp.status_code}"), None
    if resp.status_code == 404:
        return FetchResult(FetchStatus.NOT_FOUND, detail="HTTP 404"), None
    if resp.status_code >= 400:
        return FetchResult(FetchStatus.ERROR, detail=f"HTTP {resp.status_code}"), None

    ctype = resp.headers.get("content-type", "")
    try:
        data = resp.json()
    except (json.JSONDecodeError, ValueError):
        # Login page HTML instead of JSON == not authenticated.
        if "html" in ctype or "<html" in resp.text[:500].lower():
            return FetchResult(FetchStatus.SESSION_EXPIRED, detail="got HTML instead of JSON"), None
        return FetchResult(FetchStatus.ERROR, detail="response is not JSON"), None

    if not isinstance(data, dict):
        return FetchResult(FetchStatus.ERROR, detail="unexpected JSON shape"), None
    if data.get("type") != "success":
        if data.get("redirect"):
            return FetchResult(
                FetchStatus.SESSION_EXPIRED, detail=f"redirect to {data['redirect']}"
            ), None
        return FetchResult(FetchStatus.ERROR, detail=f"type={data.get('type')!r}"), None
    return None, data


def interpret_response(resp: httpx.Response) -> FetchResult:
    """orders/getorderjson response -> FetchResult. Pure, easy to unit-test."""
    failure, data = _check_envelope(resp)
    if failure:
        return failure
    model = (data.get("result") or {}).get("Model")
    if not model or not model.get("ID"):
        return FetchResult(FetchStatus.NOT_FOUND, detail="no Model in response")
    try:
        return FetchResult(FetchStatus.OK, order=parse_order(model))
    except (KeyError, TypeError, ValueError) as e:
        return FetchResult(FetchStatus.ERROR, detail=f"parse error: {e}")


def interpret_search(resp: httpx.Response, number: str) -> FetchResult:
    """orders/getjson response -> FetchResult with .summary of the EXACT number.

    The admin search is a substring search ("CB01" also finds "CB01E"),
    so we only accept a row whose OrderNumber equals the requested number.
    """
    failure, data = _check_envelope(resp)
    if failure:
        return failure
    rows = ((data.get("result") or {}).get("Model") or {}).get("Orders") or []
    wanted = _norm_number(number)
    try:
        matches = [parse_summary(r) for r in rows if _norm_number(str(r.get("OrderNumber"))) == wanted]
    except (KeyError, TypeError, ValueError) as e:
        return FetchResult(FetchStatus.ERROR, detail=f"parse error: {e}")
    if not matches:
        return FetchResult(
            FetchStatus.NOT_FOUND, detail=f"no exact match for {wanted!r} among {len(rows)} result(s)"
        )
    return FetchResult(FetchStatus.OK, summary=matches[0])


def interpret_login(resp: httpx.Response, cookie_names: list[str]) -> LoginResult:
    """main/signin response -> LoginResult. Pure."""
    if resp.status_code in (401, 403):
        return LoginResult(LoginStatus.BAD_CREDENTIALS, f"HTTP {resp.status_code}")
    if 300 <= resp.status_code < 400:
        # Some sites redirect after a successful form login.
        if cookie_names:
            return LoginResult(LoginStatus.OK, f"HTTP {resp.status_code} redirect", cookie_names)
        return LoginResult(LoginStatus.ERROR, f"HTTP {resp.status_code} without a cookie")
    if resp.status_code >= 400:
        return LoginResult(LoginStatus.ERROR, f"HTTP {resp.status_code}")
    try:
        data = resp.json()
    except (json.JSONDecodeError, ValueError):
        return LoginResult(LoginStatus.ERROR, "login response is not JSON")
    if not isinstance(data, dict):
        return LoginResult(LoginStatus.ERROR, "unexpected JSON shape")
    if data.get("type") != "success":
        msg = data.get("message") or data.get("result") or data.get("type")
        return LoginResult(LoginStatus.BAD_CREDENTIALS, f"shop said: {str(msg)[:200]}")
    if not cookie_names:
        return LoginResult(LoginStatus.ERROR, "login succeeded but no cookie was set")
    return LoginResult(LoginStatus.OK, "", cookie_names)


# ------------------------------------------------------------------ client
class ShopClient:
    def __init__(
        self,
        cfg: ShopConfig,
        transport: httpx.BaseTransport | None = None,
        clock: Callable[[], float] = time.monotonic,
    ):
        self.cfg = cfg
        self._clock = clock
        self._last_login_attempt: float | None = None
        url = httpx.URL(cfg.base_url)
        self._host = url.host
        self._site = f"{url.scheme}://{url.host}"
        self._http = httpx.Client(
            timeout=cfg.timeout,
            follow_redirects=False,  # a redirect means "go to login"
            transport=transport,
            headers={
                "accept": "application/json, text/plain, */*",
                "x-requested-with": "XMLHttpRequest",
                "user-agent": cfg.user_agent,
            },
        )
        if cfg.cookie.strip():
            self.set_cookie_header(cfg.cookie)

    def close(self) -> None:
        self._http.close()

    # ---- cookies
    @property
    def has_credentials(self) -> bool:
        return bool(self.cfg.login_email and self.cfg.login_password)

    def set_cookie_header(self, header: str) -> None:
        """Load a 'name=value; name2=value2' header (pasted from DevTools)."""
        self._http.cookies.clear()
        for part in header.split(";"):
            name, sep, value = part.strip().partition("=")
            if sep and name:
                self._http.cookies.set(name, value, domain=self._host, path="/")

    def cookie_names(self) -> list[str]:
        return sorted({c.name for c in self._http.cookies.jar})

    def cookie_header(self) -> str:
        """Current session as a Cookie header (e.g. to persist it across restarts)."""
        return "; ".join(f"{c.name}={c.value}" for c in self._http.cookies.jar)

    # ---- requests
    def _post(self, url: str, payload: dict, referer: str) -> httpx.Response:
        return self._http.post(
            url,
            content=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "content-type": "application/json;charset=UTF-8",
                "referer": referer,
                "origin": self._site,
            },
        )

    def login(self, force: bool = False) -> LoginResult:
        """Log in with the configured credentials. Throttled unless force=True.

        On failure the previous cookies (e.g. a pasted cookie) are restored.
        """
        if not self.has_credentials:
            return LoginResult(LoginStatus.NOT_CONFIGURED, "no login credentials configured")
        now = self._clock()
        if (
            not force
            and self._last_login_attempt is not None
            and now - self._last_login_attempt < self.cfg.min_relogin_interval
        ):
            ago = int(now - self._last_login_attempt)
            return LoginResult(LoginStatus.THROTTLED, f"last login attempt {ago}s ago")
        self._last_login_attempt = now

        signin = self.cfg.resolved_signin_url()
        backup = list(self._http.cookies.jar)
        self._http.cookies.clear()
        try:
            resp = self._post(
                signin,
                {
                    "email": self.cfg.login_email,
                    "password": self.cfg.login_password,
                    "rememberme": "true",
                },
                referer=signin.rsplit("/", 1)[0],
            )
            result = interpret_login(resp, self.cookie_names())
        except httpx.HTTPError as e:
            result = LoginResult(LoginStatus.ERROR, f"{type(e).__name__}: {e}")
        if result.status != LoginStatus.OK:
            self._http.cookies.clear()
            for c in backup:
                self._http.cookies.jar.set_cookie(c)
        return result

    def _with_session(self, op: Callable[[], FetchResult]) -> FetchResult:
        """Run op; on SESSION_EXPIRED log in (if possible) and retry once."""
        if not self.cookie_names() and self.has_credentials:
            self.login()
        res = op()
        if res.status == FetchStatus.SESSION_EXPIRED and self.has_credentials:
            lr = self.login()
            if lr.status == LoginStatus.OK:
                res = op()
            else:
                res.detail = f"{res.detail}; re-login {lr.status.value}: {lr.detail}".strip("; ")
        return res

    def _find_order_once(self, number: str) -> FetchResult:
        if not self.cookie_names():
            return FetchResult(FetchStatus.SESSION_EXPIRED, detail="no session cookie")
        base = self.cfg.base_url.rstrip("/")
        wanted = _norm_number(number)
        try:
            resp = self._post(
                f"{base}/orders/getjson",
                {"#": None, "query": wanted},
                referer=f"{base}/orders?query={quote(wanted)}&count=10",
            )
        except httpx.HTTPError as e:
            return FetchResult(FetchStatus.ERROR, detail=f"{type(e).__name__}: {e}")
        return interpret_search(resp, wanted)

    def _fetch_order_once(self, order_id: int) -> FetchResult:
        if not self.cookie_names():
            return FetchResult(FetchStatus.SESSION_EXPIRED, detail="no session cookie")
        base = self.cfg.base_url.rstrip("/")
        try:
            resp = self._post(
                f"{base}/orders/getorderjson",
                {"#": None, "id": order_id, "query": None},
                referer=f"{base}/orders/edit/{order_id}",
            )
        except httpx.HTTPError as e:
            return FetchResult(FetchStatus.ERROR, detail=f"{type(e).__name__}: {e}")
        return interpret_response(resp)

    # ---- public API
    def find_order(self, number: str) -> FetchResult:
        """Order number from the email (e.g. 'CB01E') -> FetchResult with .summary (incl. ID)."""
        return self._with_session(lambda: self._find_order_once(number))

    def fetch_order(self, order_id: int) -> FetchResult:
        """Internal order ID -> FetchResult with .order (items, sizes, phone...)."""
        return self._with_session(lambda: self._fetch_order_once(order_id))

    def fetch_order_by_number(self, number: str) -> FetchResult:
        """find_order + fetch_order. Result carries both .summary and .order."""
        found = self.find_order(number)
        if found.status != FetchStatus.OK or found.summary is None:
            return found
        res = self.fetch_order(found.summary.id)
        res.summary = found.summary
        return res


# ------------------------------------------------------------------ CLI
def _main() -> None:
    """Manual checks (run on the server):

    python -m app.shop_client CB01E                      # by order number
    python -m app.shop_client --id 558938                # by internal ID
    python -m app.shop_client --login-only               # just test the login

    Credentials: --email / OLA_SHOP_EMAIL, password from OLA_SHOP_PASSWORD or a
    prompt. Without credentials the cookie from --cookie-file is used.
    """
    import argparse
    import getpass
    import os
    from dataclasses import asdict
    from pathlib import Path

    ap = argparse.ArgumentParser(description="Fetch one order from the shop admin")
    ap.add_argument("number", nargs="?", help="order number from the email, e.g. CB01E")
    ap.add_argument("--id", type=int, help="internal order ID (from /orders/edit/<ID>)")
    ap.add_argument("--login-only", action="store_true", help="only test the login")
    ap.add_argument("--base-url", default="https://forreal-wear.com/eco/ukr/shop")
    ap.add_argument("--email", default=os.environ.get("OLA_SHOP_EMAIL", ""))
    ap.add_argument("--cookie-file", default="cookie.txt",
                    help="fallback: file containing the Cookie header value from DevTools")
    args = ap.parse_args()
    if not (args.number or args.id or args.login_only):
        ap.error("give an order number, --id or --login-only")

    password = ""
    if args.email:
        password = os.environ.get("OLA_SHOP_PASSWORD") or getpass.getpass("Shop password: ")
    cookie_path = Path(args.cookie_file)
    cookie = cookie_path.read_text().strip() if cookie_path.exists() else ""

    client = ShopClient(ShopConfig(base_url=args.base_url, cookie=cookie,
                                   login_email=args.email, login_password=password))
    out: dict = {}
    try:
        if args.login_only:
            lr = client.login(force=True)
            out = {"login": lr.status.value, "detail": lr.detail}
        else:
            res = client.fetch_order(args.id) if args.id else client.fetch_order_by_number(args.number)
            out = {
                "status": res.status.value,
                "detail": res.detail,
                "summary": asdict(res.summary) if res.summary else None,
                "order": asdict(res.order) if res.order else None,
            }
        out["cookie_names"] = client.cookie_names()  # names only, never values
    finally:
        client.close()
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    _main()
