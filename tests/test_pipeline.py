"""Flow toggle: email only (flow 1) vs email + shop order details (flow 2)."""

import json
import subprocess
import sys
from pathlib import Path

import httpx

from app.message import SIZE_PLACEHOLDER, EmailOrder
from app.pipeline import build_notification
from app.settings import Features, load_features

FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "order_558938.json").read_text())
EMAIL = EmailOrder(number="B982B", customer_name="Наталія", phone="+380 63 123 45 67",
                   items=["Шовковиста нічна сорочка (1 990 ₴ x 1)"], total="1 990 ₴")
FLOW1 = Features(fetch_order_details=False)
FLOW2 = Features(fetch_order_details=True)


class ExplodingFetcher:
    def fetch_order_by_number(self, number):  # pragma: no cover
        raise AssertionError("flow 1 must not call the shop")


def test_flag_is_off_by_default(monkeypatch):
    monkeypatch.delenv("OLA_FETCH_ORDER_DETAILS", raising=False)
    assert load_features().fetch_order_details is False
    monkeypatch.setenv("OLA_FETCH_ORDER_DETAILS", "true")
    assert load_features().fetch_order_details is True


def test_flow1_uses_email_only():
    n = build_notification(EMAIL, FLOW1, fetcher=ExplodingFetcher())
    assert n.fetch_status is None and n.needs_size is False
    assert "• Шовковиста нічна сорочка (1 990 ₴ x 1)" in n.text
    assert "розмір" not in n.text and SIZE_PLACEHOLDER not in n.text
    assert "⚠️" not in n.text
    assert "💰 Всього: 1 990 ₴" in n.text
    assert "https://wa.me/380631234567" in n.text


def test_flow1_does_not_import_shop_client():
    code = (
        "import sys; from app.message import EmailOrder; from app.pipeline import build_notification;"
        "from app.settings import Features;"
        "build_notification(EmailOrder('X1','A','+380631234567',['item']), Features());"
        "assert 'app.shop_client' not in sys.modules, 'shop client was imported'"
    )
    subprocess.run([sys.executable, "-c", code], check=True, cwd=Path(__file__).parent.parent)


def _shop(handler):
    from app.shop_client import ShopClient, ShopConfig
    return ShopClient(ShopConfig(base_url="https://shop.test/eco/ukr/shop", cookie="sid=abc"),
                      transport=httpx.MockTransport(handler))


def test_flow2_adds_sizes_from_shop():
    def handler(req):
        if req.url.path.endswith("/getjson"):
            row = {"ID": 558938, "OrderNumber": "B982B", "Client": "Наталія"}
            return httpx.Response(200, json={"type": "success",
                                             "result": {"Model": {"Orders": [row]}}})
        return httpx.Response(200, json=FIXTURE)

    n = build_notification(EMAIL, FLOW2, fetcher=_shop(handler))
    assert n.fetch_status == "ok" and n.needs_size is False
    assert "розмір: XS/S" in n.text


def test_flow2_session_expired_falls_back_to_placeholder():
    n = build_notification(EMAIL, FLOW2, fetcher=_shop(lambda r: httpx.Response(401)))
    assert n.fetch_status == "session_expired" and n.needs_size is True
    assert SIZE_PLACEHOLDER in n.text and "оновіть cookie" in n.text


def test_flow2_without_fetcher_is_a_config_error():
    import pytest
    with pytest.raises(ValueError):
        build_notification(EMAIL, FLOW2, fetcher=None)
