"""Order-number lookup (orders/getjson) and auto-login (main/signin)."""

import copy
import json
from pathlib import Path

import httpx

from app.shop_client import FetchStatus, LoginStatus, ShopClient, ShopConfig

FIX = Path(__file__).parent / "fixtures"
SEARCH = json.loads((FIX / "orders_search_CB01E.json").read_text())
ORDER = json.loads((FIX / "order_558938.json").read_text())
BASE = "https://shop.test/eco/ukr/shop"
SIGNIN = "https://shop.test/eco/ukr/main/signin"


def search_with(*numbers_ids):
    data = copy.deepcopy(SEARCH)
    row = data["result"]["Model"]["Orders"][0]
    data["result"]["Model"]["Orders"] = [
        {**row, "OrderNumber": n, "ID": i} for n, i in numbers_ids
    ]
    return data


class FakeClock:
    def __init__(self):
        self.t = 1000.0

    def __call__(self):
        return self.t


def make(handler, clock=None, **cfg):
    return ShopClient(
        ShopConfig(base_url=BASE, **cfg),
        transport=httpx.MockTransport(handler),
        clock=clock or FakeClock(),
    )


def login_ok(req):
    return httpx.Response(200, json={"type": "success", "redirect": None},
                          headers={"set-cookie": "sid=fresh; Path=/; HttpOnly"})


# ------------------------------------------------------------------ lookup
def test_signin_url_is_derived_from_base():
    assert ShopConfig(base_url=BASE + "/").resolved_signin_url() == SIGNIN


def test_find_order_exact_match():
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        seen["body"] = json.loads(req.content)
        return httpx.Response(200, json=SEARCH)

    res = make(handler, cookie="sid=abc").find_order(" cb01e ")
    assert res.status == FetchStatus.OK
    assert res.summary.id == 1365649
    assert res.summary.client == "Антон Тихомиров"
    assert res.summary.final_price == "2 450 ₴"
    assert seen["url"] == BASE + "/orders/getjson"
    assert seen["body"] == {"#": None, "query": "CB01E"}


def test_find_order_ignores_substring_matches():
    data = search_with(("CB01E", 2), ("CB01", 1))
    res = make(lambda r: httpx.Response(200, json=data), cookie="sid=abc").find_order("CB01")
    assert res.status == FetchStatus.OK
    assert res.summary.id == 1


def test_find_order_not_found_when_no_exact_match():
    data = search_with(("CB01E", 2))
    res = make(lambda r: httpx.Response(200, json=data), cookie="sid=abc").find_order("CB01")
    assert res.status == FetchStatus.NOT_FOUND


def test_fetch_by_number_does_lookup_then_details():
    calls = []

    def handler(req):
        calls.append(req.url.path)
        if req.url.path.endswith("/getjson"):
            return httpx.Response(200, json=search_with(("B982B", 558938)))
        assert json.loads(req.content)["id"] == 558938
        return httpx.Response(200, json=ORDER)

    res = make(handler, cookie="sid=abc").fetch_order_by_number("B982B")
    assert res.status == FetchStatus.OK
    assert res.summary.id == 558938 and res.order.items[0].size == "XS/S"
    assert [p.rsplit("/", 1)[1] for p in calls] == ["getjson", "getorderjson"]


def test_pasted_cookie_header_is_sent():
    seen = {}

    def handler(req):
        seen["cookie"] = req.headers.get("cookie", "")
        return httpx.Response(200, json=SEARCH)

    make(handler, cookie="a=1; b=2=x").find_order("CB01E")
    assert "a=1" in seen["cookie"] and "b=2=x" in seen["cookie"]


# ------------------------------------------------------------------ login
def test_login_without_cookie_then_lookup_uses_new_session():
    seen = {}

    def handler(req):
        if str(req.url) == SIGNIN:
            seen["login_body"] = json.loads(req.content)
            return login_ok(req)
        seen["cookie"] = req.headers.get("cookie")
        return httpx.Response(200, json=SEARCH)

    c = make(handler, login_email="me@x.test", login_password="pw")
    res = c.find_order("CB01E")
    assert res.status == FetchStatus.OK
    assert seen["login_body"] == {"email": "me@x.test", "password": "pw", "rememberme": "true"}
    assert seen["cookie"] == "sid=fresh"
    assert c.cookie_names() == ["sid"]


def test_expired_session_relogs_in_once_and_retries():
    calls = {"signin": 0, "search": 0}

    def handler(req):
        if str(req.url) == SIGNIN:
            calls["signin"] += 1
            return login_ok(req)
        calls["search"] += 1
        if req.headers.get("cookie") == "sid=old":
            return httpx.Response(302, headers={"location": "/login"})
        return httpx.Response(200, json=SEARCH)

    c = make(handler, cookie="sid=old", login_email="me@x.test", login_password="pw")
    assert c.find_order("CB01E").status == FetchStatus.OK
    assert calls == {"signin": 1, "search": 2}


def test_bad_credentials_keep_pasted_cookie_and_report():
    def handler(req):
        if str(req.url) == SIGNIN:
            return httpx.Response(200, json={"type": "error", "message": "Невірний пароль"})
        return httpx.Response(200, json={"type": "error", "redirect": "/login"})

    c = make(handler, cookie="sid=old", login_email="me@x.test", login_password="bad")
    res = c.find_order("CB01E")
    assert res.status == FetchStatus.SESSION_EXPIRED
    assert "bad_credentials" in res.detail
    assert c.cookie_header() == "sid=old"  # fallback cookie restored


def test_relogin_is_throttled():
    clock = FakeClock()
    calls = {"signin": 0}

    def handler(req):
        if str(req.url) == SIGNIN:
            calls["signin"] += 1
            return httpx.Response(200, json={"type": "error", "message": "nope"})
        return httpx.Response(401)

    c = make(handler, clock=clock, cookie="sid=old", login_email="me@x.test", login_password="bad")
    c.find_order("CB01E")
    clock.t += 10
    res = c.find_order("CB01E")
    assert calls["signin"] == 1
    assert "throttled" in res.detail
    clock.t += 60
    c.find_order("CB01E")
    assert calls["signin"] == 2


def test_login_not_configured():
    c = make(lambda r: httpx.Response(500))
    assert c.login().status == LoginStatus.NOT_CONFIGURED


def test_login_success_without_cookie_is_error():
    c = make(lambda r: httpx.Response(200, json={"type": "success"}),
             login_email="me@x.test", login_password="pw")
    assert c.login().status == LoginStatus.ERROR
