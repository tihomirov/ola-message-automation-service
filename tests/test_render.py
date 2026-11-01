from pathlib import Path

from app.config import AppConfig
from app.email_parser import parse_order_email
from app.render import DEFAULT_TEMPLATE, build_context, phone_e164, render_message

FIX = Path(__file__).parent / "fixtures"
ORDER = parse_order_email((FIX / "order_email_CD109_direct.eml").read_bytes()).order


def test_phone_normalisation():
    assert phone_e164("+380 67 123-45-67") == "380671234567"
    assert phone_e164("0671234567") == "380671234567"
    assert phone_e164("671234567") == "380671234567"
    assert phone_e164(None) is None


def test_empty_template_uses_default_template():
    cfg = AppConfig()
    assert render_message(cfg, ORDER) == render_message_with(DEFAULT_TEMPLATE)


def render_message_with(text, order=ORDER, details=None, status=None):
    cfg = AppConfig()
    cfg.template.text = text
    return render_message(cfg, order, details, status)


def test_default_template_cod_flow1():
    text = render_message_with(DEFAULT_TEMPLATE)
    assert text.startswith("Олена, вітаємо\n\n[[quote]]\nПросимо підтвердити ваше замовлення")
    assert "\n шовковиста нічна сорочка зі шнурівкою\n розмір - SIZE\n колір - COLOR\n" in text
    assert "\n Оплата при отриманні (накладений платіж)\n[[/quote]]" in text
    assert "💬\nTelegram: https://t.me/+380670000000\n" in text
    assert text.endswith("WhatsApp: https://wa.me/380670000000")
    assert "\n\n\n" not in text


def test_default_template_card_payment():
    from dataclasses import replace
    order = replace(ORDER, payment="Оплата картами Visa, Mastercard, Apple Pay, Google Pay")
    text = render_message_with(DEFAULT_TEMPLATE, order)
    assert "Ваше замовлення на сайті forreal-wear.com отримане:" in text
    assert "Відправка буде сьогодні\n\nДякуємо за замовлення,\nКоманда For Real\n[[/quote]]" in text
    assert "Просимо підтвердити" not in text


def test_default_template_flow2_sizes_colours_and_repeat():
    import json
    from app.shop_client import FetchStatus, parse_order
    m = json.loads((FIX / "order_558938.json").read_text())["result"]["Model"]
    m["Products"] = m["Products"] + [dict(m["Products"][0], Name="Халат довгий з вирізами",
                                          ModificationName="Розмір: onesize, Колір: Молочний", Count=2)]
    text = render_message_with(DEFAULT_TEMPLATE, ORDER, parse_order(m), FetchStatus.OK)
    assert text.startswith("Олена, вітаємо")  # name from the email, not the shop account
    assert "\n класична шовковиста піжама з кантом\n розмір - XS/S\n колір - чорний\n" in text
    assert "\n халат довгий з вирізами\n розмір - onesize\n колір - молочний\n кількість - 2\n" in text


def test_item_title_and_payment_kind():
    from app.render import item_title, payment_kind
    assert item_title("Сукні, SALE Сатинова сукня з відкритими плечима") == "Сатинова сукня з відкритими плечима"
    assert item_title("Халати Халат довгий з вирізами") == "Халат довгий з вирізами"
    assert item_title("Халат довгий з вирізами") == "Халат довгий з вирізами"  # no category
    assert payment_kind("Накладений платіж (оплата при отриманні)") == "cod"
    assert payment_kind("Оплата картами Visa, Mastercard, Apple Pay, Google Pay") == "card"
    assert payment_kind("Переказ на рахунок") == "other"


def test_quote_box_html_and_plain():
    from app.mailer import text_to_html
    from app.render import strip_quote_markers
    text = render_message_with(DEFAULT_TEMPLATE)
    html = text_to_html(text)
    assert html.count("border-left:4px solid") == 1 and "[[quote]]" not in html
    assert '<a href="https://wa.me/380670000000">' in html
    plain = strip_quote_markers(text)
    assert "[[" not in plain and "Просимо підтвердити" in plain


def test_broken_template_falls_back():
    cfg = AppConfig()
    cfg.template.text = "{{ order.number "
    assert render_message(cfg, ORDER).startswith("🛍 Нове замовлення №CD109")


def test_links_without_phone_are_dropped():
    ORDER2 = type(ORDER)(number="X", customer_name="A", phone=None)
    ctx = build_context(ORDER2, links=AppConfig().template.links)
    assert ctx["links"] == {} and ctx["links_list"] == []


def test_sandbox_blocks_unsafe_access():
    cfg = AppConfig()
    cfg.template.text = "{{ ''.__class__.__mro__ }}"
    # SecurityError is a TemplateError -> built-in message
    assert render_message(cfg, ORDER).startswith("🛍")
