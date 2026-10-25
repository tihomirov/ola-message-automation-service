"""Client for the shop admin's internal order endpoint.

The admin has no public API. We replay the request the admin UI itself makes
(POST .../shop/orders/getorderjson) using the session cookie copied from the
browser. The cookie expires, so every fetch returns one of these states:

    OK               -> order parsed, sizes available
    SESSION_EXPIRED  -> cookie is missing/expired: notify admin, use placeholder
    NOT_FOUND        -> session fine, but no such order
    ERROR            -> network problem / unexpected response
"""

from __future__ import annotations

import enum
import json
import re
from dataclasses import dataclass, field

import httpx

SIZE_RE = re.compile(r"Розмір\s*:\s*([^,]+)", re.IGNORECASE)
COLOR_RE = re.compile(r"Колір\s*:\s*([^,]+)", re.IGNORECASE)


class FetchStatus(str, enum.Enum):
    OK = "ok"
    SESSION_EXPIRED = "session_expired"
    NOT_FOUND = "not_found"
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
class FetchResult:
    status: FetchStatus
    order: OrderDetails | None = None
    detail: str = ""


@dataclass
class ShopConfig:
    base_url: str  # e.g. https://forreal-wear.com/eco/ukr/shop
    cookie: str  # full "Cookie" request header value copied from DevTools
    timeout: float = 15.0
    user_agent: str = (
        "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"
    )


# ------------------------------------------------------------------ parsing
def _extract(regex: re.Pattern, text: str) -> str | None:
    m = regex.search(text or "")
    return m.group(1).strip() if m else None


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


def interpret_response(resp: httpx.Response) -> FetchResult:
    """Turn a raw HTTP response into a FetchResult. Pure, easy to unit-test."""
    if resp.status_code in (301, 302, 303, 307, 308, 401, 403):
        return FetchResult(FetchStatus.SESSION_EXPIRED, detail=f"HTTP {resp.status_code}")
    if resp.status_code == 404:
        return FetchResult(FetchStatus.NOT_FOUND, detail="HTTP 404")
    if resp.status_code >= 400:
        return FetchResult(FetchStatus.ERROR, detail=f"HTTP {resp.status_code}")

    ctype = resp.headers.get("content-type", "")
    try:
        data = resp.json()
    except (json.JSONDecodeError, ValueError):
        # Login page HTML instead of JSON == not authenticated.
        if "html" in ctype or "<html" in resp.text[:500].lower():
            return FetchResult(FetchStatus.SESSION_EXPIRED, detail="got HTML instead of JSON")
        return FetchResult(FetchStatus.ERROR, detail="response is not JSON")

    if not isinstance(data, dict):
        return FetchResult(FetchStatus.ERROR, detail="unexpected JSON shape")
    if data.get("type") != "success":
        if data.get("redirect"):
            return FetchResult(
                FetchStatus.SESSION_EXPIRED, detail=f"redirect to {data['redirect']}"
            )
        return FetchResult(FetchStatus.ERROR, detail=f"type={data.get('type')!r}")

    model = (data.get("result") or {}).get("Model")
    if not model or not model.get("ID"):
        return FetchResult(FetchStatus.NOT_FOUND, detail="no Model in response")
    try:
        return FetchResult(FetchStatus.OK, order=parse_order(model))
    except (KeyError, TypeError, ValueError) as e:
        return FetchResult(FetchStatus.ERROR, detail=f"parse error: {e}")


# ------------------------------------------------------------------ client
class ShopClient:
    def __init__(self, cfg: ShopConfig, transport: httpx.BaseTransport | None = None):
        self.cfg = cfg
        self._http = httpx.Client(
            timeout=cfg.timeout,
            follow_redirects=False,  # a redirect means "go to login"
            transport=transport,
        )

    def close(self) -> None:
        self._http.close()

    def fetch_order(self, order_id: int) -> FetchResult:
        if not self.cfg.cookie.strip():
            return FetchResult(FetchStatus.SESSION_EXPIRED, detail="no cookie configured")
        base = self.cfg.base_url.rstrip("/")
        try:
            resp = self._http.post(
                f"{base}/orders/getorderjson",
                content=json.dumps({"#": None, "id": order_id, "query": None}),
                headers={
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json;charset=UTF-8",
                    "x-requested-with": "XMLHttpRequest",
                    "referer": f"{base}/orders/edit/{order_id}",
                    "origin": f"{httpx.URL(base).scheme}://{httpx.URL(base).host}",
                    "user-agent": self.cfg.user_agent,
                    "cookie": self.cfg.cookie.strip(),
                },
            )
        except httpx.HTTPError as e:
            return FetchResult(FetchStatus.ERROR, detail=f"{type(e).__name__}: {e}")
        return interpret_response(resp)


# ------------------------------------------------------------------ CLI
def _main() -> None:
    """Manual check:  python -m app.shop_client 558938 --cookie-file cookie.txt"""
    import argparse
    from dataclasses import asdict
    from pathlib import Path

    ap = argparse.ArgumentParser(description="Fetch one order from the shop admin")
    ap.add_argument("order_id", type=int, help="internal order ID (from /orders/edit/<ID>)")
    ap.add_argument("--base-url", default="https://forreal-wear.com/eco/ukr/shop")
    ap.add_argument("--cookie-file", default="cookie.txt",
                    help="file containing the Cookie header value from DevTools")
    args = ap.parse_args()

    cookie_path = Path(args.cookie_file)
    cookie = cookie_path.read_text().strip() if cookie_path.exists() else ""
    client = ShopClient(ShopConfig(base_url=args.base_url, cookie=cookie))
    try:
        res = client.fetch_order(args.order_id)
    finally:
        client.close()
    print(json.dumps(
        {"status": res.status.value, "detail": res.detail,
         "order": asdict(res.order) if res.order else None},
        ensure_ascii=False, indent=2,
    ))


if __name__ == "__main__":
    _main()
