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


def test_empty_template_uses_builtin():
    assert render_message(AppConfig(), ORDER).startswith("🛍 Нове замовлення №CD109")


def test_default_template_renders():
    cfg = AppConfig()
    cfg.template.text = DEFAULT_TEMPLATE
    text = render_message(cfg, ORDER)
    assert "👤 Олена Тестова" in text
    assert "• Сукні Шовковиста нічна сорочка зі шнурівкою (1 шт × 1 990 ₴)" in text
    assert "🚚 Самовивіз" in text and "WhatsApp: https://wa.me/380670000000" in text
    assert "розмір" not in text and "\n\n\n" not in text


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
