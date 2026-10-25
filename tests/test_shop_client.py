import json
from pathlib import Path

import httpx
import pytest

from app.message import EmailOrder, SIZE_PLACEHOLDER, build_message, chat_links
from app.shop_client import FetchStatus, ShopClient, ShopConfig

FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "order_558938.json").read_text())
CFG = ShopConfig(base_url="https://shop.test/eco/ukr/shop", cookie="sid=abc")


def client_for(handler) -> ShopClient:
    return ShopClient(CFG, transport=httpx.MockTransport(handler))


def test_ok_parses_size_and_color():
    seen = {}

    def handler(req: httpx.Request):
        seen["url"] = str(req.url)
        seen["body"] = json.loads(req.content)
        seen["cookie"] = req.headers.get("cookie")
        return httpx.Response(200, json=FIXTURE)

    res = client_for(handler).fetch_order(558938)
    assert res.status == FetchStatus.OK
    assert seen["url"].endswith("/orders/getorderjson")
    assert seen["body"] == {"#": None, "id": 558938, "query": None}
    assert seen["cookie"] == "sid=abc"
    item = res.order.items[0]
    assert item.size == "XS/S"
    assert item.color == "Чорний"
    assert res.order.number == "B982B"


@pytest.mark.parametrize(
    "response",
    [
        httpx.Response(302, headers={"location": "/login"}),
        httpx.Response(401),
        httpx.Response(200, text="<html><body>Login</body></html>",
                       headers={"content-type": "text/html"}),
        httpx.Response(200, json={"type": "error", "redirect": "/login"}),
    ],
)
def test_session_expired_states(response):
    res = client_for(lambda req: response).fetch_order(1)
    assert res.status == FetchStatus.SESSION_EXPIRED


def test_no_cookie_is_expired_without_request():
    def handler(req):  # pragma: no cover
        raise AssertionError("must not call the site")

    c = ShopClient(ShopConfig(base_url=CFG.base_url, cookie=""),
                   transport=httpx.MockTransport(handler))
    assert c.fetch_order(1).status == FetchStatus.SESSION_EXPIRED


def test_network_error():
    def handler(req):
        raise httpx.ConnectError("boom")

    assert client_for(handler).fetch_order(1).status == FetchStatus.ERROR


def test_message_with_and_without_session():
    email = EmailOrder(number="CD109", customer_name="Наталія", phone="+380 63 123 45 67",
                       items=["Шовковиста нічна сорочка (1 990 ₴ x 1)"], total="1 990 ₴")
    ok = client_for(lambda r: httpx.Response(200, json=FIXTURE)).fetch_order(558938)

    msg_ok = build_message(email, ok.status, ok.order)
    assert "розмір: XS/S" in msg_ok
    assert "wa.me/380670000000" in msg_ok

    msg_expired = build_message(email, FetchStatus.SESSION_EXPIRED, None)
    assert SIZE_PLACEHOLDER in msg_expired
    assert "оновіть cookie" in msg_expired
    assert "https://t.me/+380631234567" in msg_expired


def test_chat_links_empty_phone():
    assert chat_links(None) == {}
