"""Configurable message template (Jinja2, sandboxed) + links library.

config.yaml:
    template:
      text: |            # empty = the built-in message (app/message.py)
        🛍 Нове замовлення №{{ order.number }}
        ...
      links:             # URL templates; available as {{ links.<Name> }} and in `links_list`
        - {name: WhatsApp, url: "https://wa.me/{{ customer.phone_e164 }}"}

Variables: see VARIABLES_HELP. A template that fails to render falls back to the
built-in message, so an order is never dropped because of a template typo.
"""

from __future__ import annotations

import logging
import re
from dataclasses import asdict

from jinja2 import StrictUndefined, TemplateError
from jinja2.sandbox import SandboxedEnvironment

from .config import AppConfig, LinkConfig
from .message import SIZE_PLACEHOLDER, EmailOrder, build_message

log = logging.getLogger("ola.render")

DEFAULT_TEMPLATE = """🛍 Нове замовлення №{{ order.number }}
👤 {{ customer.name }}
{% if customer.phone %}📞 {{ customer.phone }}
{% endif %}
{% for it in items %}• {{ it.name }}{% if it.size %} — розмір: {{ it.size }}{% elif flags.size_missing %} — розмір: {{ size_placeholder }}{% endif %} ({{ it.qty }} шт × {{ it.price }})
{% endfor %}
💰 Всього: {{ order.total }}

{% if order.delivery %}🚚 {{ order.delivery }}
{% endif %}{% if order.address %}📍 {{ order.address }}
{% endif %}{% if order.payment %}💳 {{ order.payment }}
{% endif %}{% if order.comment %}📝 {{ order.comment }}
{% endif %}
{% if links_list %}💬 {% for l in links_list %}{{ l.name }}: {{ l.url }}{% if not loop.last %} | {% endif %}{% endfor %}
{% endif %}{% if flags.session_expired %}
⚠️ Сесія адмінки закінчилась — розміри не отримано.
{% elif flags.fetch_error %}
⚠️ Не вдалося отримати деталі замовлення з сайту.
{% endif %}"""

VARIABLES_HELP = {
    "order": "number, total, delivery, address, payment, additions, comment",
    "customer": "name, phone, phone_e164 (e.g. 380671234567), email",
    "items": "list of: name, price, qty, sum, size, color (size/color only in flow 2)",
    "links": "links by name, e.g. {{ links.WhatsApp }}",
    "links_list": "list of: name, url (only links whose URL could be built)",
    "flags": "size_missing, session_expired, fetch_error (flow 2)",
    "size_placeholder": SIZE_PLACEHOLDER,
}

_env = SandboxedEnvironment(undefined=StrictUndefined, keep_trailing_newline=False,
                            trim_blocks=False, autoescape=False)


def phone_e164(phone: str | None) -> str | None:
    """'+380 67 123-45-67' / '0671234567' / '380671234567' -> '380671234567'."""
    d = re.sub(r"\D", "", phone or "")
    if not d:
        return None
    if len(d) == 10 and d.startswith("0"):
        d = "38" + d
    elif len(d) == 9:
        d = "380" + d
    return d


def build_context(order: EmailOrder, details=None, fetch_status: str | None = None,
                  links: list[LinkConfig] | None = None) -> dict:
    phone = (details.phone if details else None) or order.phone
    name = (details.customer_name if details else "") or order.customer_name
    if details and details.items:
        items = [{"name": it.name, "price": it.price, "qty": it.count, "sum": "",
                  "size": it.size, "color": it.color} for it in details.items]
    elif order.item_details:
        items = [{**asdict(it), "size": None, "color": None} for it in order.item_details]
    else:
        items = [{"name": raw, "price": "", "qty": "", "sum": "", "size": None, "color": None}
                 for raw in order.items]
    ctx = {
        "order": {
            "number": order.number,
            "total": order.total or "",
            "delivery": order.delivery or "",
            "address": order.address or "",
            "payment": order.payment or "",
            "additions": order.additions or "",
            "comment": order.comment or "",
        },
        "customer": {"name": name, "phone": phone or "", "phone_e164": phone_e164(phone) or "",
                     "email": order.customer_email or ""},
        "items": items,
        "flags": {
            "size_missing": fetch_status is not None and (
                fetch_status != "ok" or any(not i["size"] for i in items)),
            "session_expired": fetch_status == "session_expired",
            "fetch_error": fetch_status in ("error", "not_found"),
        },
        "size_placeholder": SIZE_PLACEHOLDER,
    }
    built = {}
    for link in links or []:
        try:
            url = _env.from_string(link.url).render(ctx).strip()
        except TemplateError:
            url = ""
        if url and link.name and not url.endswith(("/", "+", "=", "%2B")):
            built[link.name] = url
    ctx["links"] = built
    ctx["links_list"] = [{"name": k, "url": v} for k, v in built.items()]
    return ctx


def render_template(text: str, ctx: dict) -> str:
    out = _env.from_string(text).render(ctx)
    out = re.sub(r"\n{3,}", "\n\n", out)  # collapse blank lines left by empty blocks
    return out.strip()


def render_message(cfg: AppConfig, order: EmailOrder, details=None, status=None) -> str:
    """The notification text: config template if set, else the built-in message."""
    fetch_status = getattr(status, "value", status)
    text = cfg.template.text.strip()
    if not text:
        return build_message(order, status, details)
    try:
        return render_template(text, build_context(order, details, fetch_status,
                                                   cfg.template.links))
    except TemplateError as e:
        log.error("template error, using the built-in message: %s", e)
        return build_message(order, status, details)
