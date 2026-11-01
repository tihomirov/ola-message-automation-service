from pathlib import Path

import pytest

from app.email_parser import NotAnOrderEmail, parse_order_email, parse_order_text
from app.message import build_message

FIX = Path(__file__).parent / "fixtures"
DIRECT = (FIX / "order_email_CD109_direct.eml").read_bytes()
FORWARDED = (FIX / "order_email_CD109_forwarded.eml").read_bytes()


@pytest.mark.parametrize("raw", [DIRECT, FORWARDED], ids=["direct", "forwarded"])
def test_parses_both_shapes(raw):
    p = parse_order_email(raw)
    o = p.order
    assert o.number == "CD109"
    assert o.customer_name == "Олена Тестова"
    assert o.phone == "+380670000000"
    assert o.customer_email == "customer@example.com"
    assert o.total == "1 990 ₴"
    assert o.delivery == "Самовивіз з «Нова Пошта» (за тарифами перевізника)"
    assert o.address == "Київ, Відділення №1 (до 10 кг): вул. Тестова, 1"
    assert o.payment == "Накладений платіж (оплата при отриманні)"
    assert o.additions is None and o.comment is None  # "-" means empty
    assert len(p.items) == 1
    it = p.items[0]
    assert (it.name, it.price, it.qty, it.sum) == (
        "Сукні Шовковиста нічна сорочка зі шнурівкою", "1 990 ₴", 1, "1 990 ₴")
    assert o.items == ["Сукні Шовковиста нічна сорочка зі шнурівкою (1 990 ₴ x 1)"]
    assert p.subject == "Замовлення на сайті №CD109 на суму 1 990 ₴"


def test_forwarded_by_is_recorded():
    assert parse_order_email(DIRECT).forwarded_by is None
    assert parse_order_email(FORWARDED).forwarded_by == "shop-owner@example.com"


def test_forwarders_allow_list():
    with pytest.raises(NotAnOrderEmail):
        parse_order_email(FORWARDED, forwarders=["someone@else.com"])
    assert parse_order_email(FORWARDED, forwarders=["Shop-Owner@example.com"]).order.number == "CD109"


def test_rejects_unknown_sender():
    raw = DIRECT.replace(b"postman@site-x.pro", b"evil@example.com")
    with pytest.raises(NotAnOrderEmail, match="not allowed"):
        parse_order_email(raw)


def test_rejects_forward_of_non_shop_email():
    raw = FORWARDED.replace(b"postman@site-x.pro", b"evil@example.com")
    # body is base64, so build a minimal plain forward instead
    fake = (
        "From: a@b.com\nSubject: Fwd: x\nContent-Type: text/plain; charset=utf-8\n\n"
        "---------- Forwarded message ---------\nFrom: X <evil@example.com>\n"
        "Subject: Замовлення на сайті №A1 на суму 1 ₴\n\nВітаємо, А , дякуємо\n"
    ).encode()
    with pytest.raises(NotAnOrderEmail, match="not the shop"):
        parse_order_email(fake)
    assert raw  # silence unused


def test_rejects_other_subjects():
    with pytest.raises(NotAnOrderEmail, match="subject"):
        parse_order_text("Ваше замовлення відправлено", "текст")


def test_multiple_items():
    body = (
        "Вітаємо, Ім'я Прізвище , дякуємо за оформлення замовлення №A2.\n"
        "Піжами Піжама шовкова  (2 450 ₴ x 2) = 4 900 ₴\n"
        "Сукні Сорочка  (1 990 ₴ x 1) = 1 990 ₴\n"
        "Всього: 6 890 ₴\nТелефон: 0671112233\n"
    )
    order, items = parse_order_text("Замовлення на сайті №A2 на суму 6 890 ₴", body)
    assert [i.qty for i in items] == [2, 1]
    assert order.total == "6 890 ₴" and order.phone == "0671112233"


def test_flow1_message_from_email():
    text = build_message(parse_order_email(FORWARDED).order)
    assert "🛍 Нове замовлення №CD109" in text
    assert "👤 Олена Тестова" in text
    assert "• Сукні Шовковиста нічна сорочка зі шнурівкою (1 990 ₴ x 1)" in text
    assert "🚚 Самовивіз з «Нова Пошта»" in text and "💳 Накладений платіж" in text
    assert "https://wa.me/380670000000" in text
    assert "розмір" not in text
