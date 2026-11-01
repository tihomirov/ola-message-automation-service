"""Configurable message template (Jinja2, sandboxed) + links library.

config.yaml:
    template:
      text: ""           # empty = DEFAULT_TEMPLATE below
      links:             # URL templates; available as {{ links.<Name> }} and in `links_list`
        - {name: WhatsApp, url: "https://wa.me/{{ customer.phone_e164 }}"}

Lines between [[quote]] and [[/quote]] are the text meant for the customer: the
email shows them in a highlighted box, the backoffice adds a Copy button.

Variables: see VARIABLES_HELP. If a template fails to render, the built-in
message (app/message.py) is sent instead, so an order is never dropped.
"""

from __future__ import annotations

import logging
import re

from jinja2 import StrictUndefined, TemplateError
from jinja2.sandbox import SandboxedEnvironment

from .config import AppConfig, LinkConfig
from .message import EmailOrder, build_message, phone_digits

log = logging.getLogger("ola.render")

QUOTE_START, QUOTE_END = "[[quote]]", "[[/quote]]"
SIZE_PLACEHOLDER = "SIZE"
COLOR_PLACEHOLDER = "COLOR"

DEFAULT_SUBJECT = "[OLA.SERVICE] Нове замовлення №{number} — {customer_name}"

DEFAULT_TEMPLATE = """\
{{ customer.first_name }}, вітаємо

{% if payment_kind == 'cod' %}
[[quote]]
Просимо підтвердити ваше замовлення на сайті forreal-wear.com :
{% for it in items %}

 {{ it.title | lcfirst }}
 розмір - {{ it.size or size_placeholder }}
 колір - {{ it.color | lower if it.color else color_placeholder }}
{% if it.qty and it.qty > 1 %}
 кількість - {{ it.qty }}
{% endif %}
{% endfor %}

 Оплата при отриманні (накладений платіж)
[[/quote]]
{% elif payment_kind == 'card' %}
[[quote]]
Ваше замовлення на сайті forreal-wear.com отримане:
{% for it in items %}

 {{ it.title | lcfirst }}
 розмір - {{ it.size or size_placeholder }}
 колір - {{ it.color | lower if it.color else color_placeholder }}
{% if it.qty and it.qty > 1 %}
 кількість - {{ it.qty }}
{% endif %}
{% endfor %}

Відправка буде сьогодні

Дякуємо за замовлення,
Команда For Real
[[/quote]]
{% else %}
[[quote]]
Ваше замовлення на сайті forreal-wear.com отримане:
{% for it in items %}

 {{ it.title | lcfirst }}
 розмір - {{ it.size or size_placeholder }}
 колір - {{ it.color | lower if it.color else color_placeholder }}
{% endfor %}

 Оплата: {{ order.payment }}
[[/quote]]
{% endif %}
{% if links_list %}

💬
{% for l in links_list %}
{{ l.name }}: {{ l.url }}
{% endfor %}
{% endif %}
{% if flags.session_expired %}

⚠️ Сесія адмінки закінчилась — розмір і колір не отримано.
{% elif flags.fetch_error %}

⚠️ Не вдалося отримати деталі замовлення з сайту.
{% endif %}
"""

VARIABLES_HELP = {
    "order": "number, total, delivery, address, payment, additions, comment",
    "payment_kind": "'cod' (накладений платіж), 'card' (Visa/Mastercard/Apple Pay/Google Pay) or 'other'",
    "customer": "name, first_name, phone, phone_e164 (e.g. 380671234567), email",
    "items": "list of: title (name without the shop category), name (as in the email), "
             "price, qty, sum, size, color (size/color only in flow 2, else empty)",
    "links": "links by name, e.g. {{ links.WhatsApp }}",
    "links_list": "list of: name, url (only links whose URL could be built)",
    "flags": "size_missing, session_expired, fetch_error (flow 2)",
    "size_placeholder / color_placeholder": f"'{SIZE_PLACEHOLDER}' / '{COLOR_PLACEHOLDER}'",
    "filters": "lcfirst (first letter lowercase), lower, upper, urlencode, ...",
    "[[quote]] … [[/quote]]": "text for the customer: a box in the email, a Copy button in the backoffice",
}


def _lcfirst(value) -> str:
    s = str(value or "")
    return s[:1].lower() + s[1:]


_env = SandboxedEnvironment(undefined=StrictUndefined, keep_trailing_newline=False,
                            trim_blocks=True, lstrip_blocks=True, autoescape=False)
_env.filters["lcfirst"] = _lcfirst


def phone_e164(phone: str | None) -> str | None:
    """'+380 67 123-45-67' / '0671234567' / '380671234567' -> '380671234567'."""
    d = phone_digits(phone) or ""
    if not d:
        return None
    if len(d) == 10 and d.startswith("0"):
        d = "38" + d
    elif len(d) == 9:
        d = "380" + d
    return d


def payment_kind(payment: str | None) -> str:
    p = (payment or "").lower()
    if "накладен" in p or "при отриманні" in p:
        return "cod"
    if any(w in p for w in ("карт", "visa", "mastercard", "apple pay", "google pay")):
        return "card"
    return "other"


def item_title(name: str) -> str:
    """Item name from the email without the shop category prefix.

    The email writes '<categories> <product>', e.g. 'Сукні, SALE Сатинова сукня...'
    or 'Халати Халат довгий...'. The last category is one word right before the
    product name; both start with a capital letter.
    """
    tail = name.rsplit(", ", 1)[-1]
    first, _, rest = tail.partition(" ")
    if rest and first[:1].isupper() and rest[:1].isupper():
        return rest.strip()
    return name.strip()


def build_context(order: EmailOrder, details=None, fetch_status: str | None = None,
                  links: list[LinkConfig] | None = None) -> dict:
    # contact data: what the customer typed in the order (email) first, shop data as fallback
    phone = order.phone or (details.phone if details else None)
    name = order.customer_name or (details.customer_name if details else "")
    if details and details.items:  # flow 2: clean product name + size/colour from the shop
        items = [{"name": it.name, "title": it.name, "price": it.price, "qty": it.count,
                  "sum": "", "size": it.size, "color": it.color} for it in details.items]
    elif order.item_details:
        items = [{"name": it.name, "title": item_title(it.name), "price": it.price,
                  "qty": it.qty, "sum": it.sum, "size": None, "color": None}
                 for it in order.item_details]
    else:
        items = [{"name": raw, "title": raw, "price": "", "qty": "", "sum": "",
                  "size": None, "color": None} for raw in order.items]
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
        "payment_kind": payment_kind(order.payment),
        "customer": {"name": name, "first_name": (name.split() or [""])[0],
                     "phone": phone or "", "phone_e164": phone_e164(phone) or "",
                     "email": order.customer_email or ""},
        "items": items,
        "flags": {
            "size_missing": fetch_status is not None and (
                fetch_status != "ok" or any(not i["size"] for i in items)),
            "session_expired": fetch_status == "session_expired",
            "fetch_error": fetch_status in ("error", "not_found"),
        },
        "size_placeholder": SIZE_PLACEHOLDER,
        "color_placeholder": COLOR_PLACEHOLDER,
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
    out = re.sub(r"[ \t]+\n", "\n", out)       # trailing spaces
    out = re.sub(r"\n{3,}", "\n\n", out)       # blank lines left by empty blocks
    return out.strip("\n")


def render_message(cfg: AppConfig, order: EmailOrder, details=None, status=None) -> str:
    """The notification text: config template, or DEFAULT_TEMPLATE when empty."""
    fetch_status = getattr(status, "value", status)
    text = cfg.template.text.strip() or DEFAULT_TEMPLATE
    try:
        return render_template(text, build_context(order, details, fetch_status,
                                                   cfg.template.links))
    except TemplateError as e:
        log.error("template error, using the built-in message: %s", e)
        return build_message(order, status, details)


def strip_quote_markers(text: str) -> str:
    """Plain-text version: the [[quote]] markers are removed, the content stays."""
    lines = [ln for ln in text.split("\n") if ln.strip() not in (QUOTE_START, QUOTE_END)]
    return "\n".join(lines)
