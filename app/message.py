"""Builds the notification text. Hardcoded template for the MVP.

Flow 1 (status=None): built from the order email alone; items are shown exactly
as the email lists them, no size lines and no shop warnings.

Flow 2 (status given): order details from the shop admin add sizes. If the
fetch failed, sizes are unknown: SIZE_PLACEHOLDER is used, plus a warning line.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import TYPE_CHECKING
from urllib.parse import quote

if TYPE_CHECKING:  # flow 2 only; flow 1 never imports the shop client
    from .shop_client import FetchStatus, OrderDetails

SIZE_PLACEHOLDER = "❓ уточнити!!!"


@dataclass
class EmailOrderItem:
    name: str
    price: str
    qty: int
    sum: str


@dataclass
class EmailOrder:
    """What we can always get from the order email itself (no site access)."""

    number: str
    customer_name: str
    phone: str | None
    items: list[str] = field(default_factory=list)  # raw item lines
    total: str | None = None
    customer_email: str | None = None
    delivery: str | None = None
    address: str | None = None
    payment: str | None = None
    additions: str | None = None
    comment: str | None = None
    item_details: list[EmailOrderItem] = field(default_factory=list)


def phone_digits(phone: str | None) -> str | None:
    """Digits of the FIRST phone-like token only ('+380 63 674 11 42 <...>' -> '380636741142')."""
    if not phone:
        return None
    m = re.search(r"\+?\d[\d\s()\-]{7,}\d", phone)
    digits = re.sub(r"\D", "", m.group(0) if m else phone)
    return digits or None


def chat_links(phone: str | None) -> dict[str, str]:
    d = phone_digits(phone)
    if not d:
        return {}
    return {
        "Telegram": f"https://t.me/+{d}",
        "Viber": f"viber://chat?number={quote('+' + d)}",
        "WhatsApp": f"https://wa.me/{d}",
    }


def build_message(
    email_order: EmailOrder,
    status: "FetchStatus | None" = None,
    details: "OrderDetails | None" = None,
) -> str:
    """status=None -> flow 1 (email only). Otherwise flow 2 (with shop details)."""
    st = getattr(status, "value", status)  # FetchStatus -> "ok" / "session_expired" / ...
    name = (details.customer_name if details else "") or email_order.customer_name
    phone = (details.phone if details else None) or email_order.phone

    lines = [f"🛍 Нове замовлення №{email_order.number}", f"👤 {name}"]
    if phone:
        lines.append(f"📞 {phone}")
    lines.append("")

    if st is None:  # flow 1
        for raw in email_order.items or ["(товари див. у листі)"]:
            lines.append(f"• {raw}")
    elif st == "ok" and details:
        for it in details.items:
            size = it.size or SIZE_PLACEHOLDER
            lines.append(f"• {it.name} — розмір: {size} (x{it.count})")
    else:
        for raw in email_order.items or ["(товари див. у листі)"]:
            lines.append(f"• {raw} — розмір: {SIZE_PLACEHOLDER}")

    total = (f"{details.total} {details.currency}" if details else email_order.total)
    if total:
        lines += ["", f"💰 Всього: {total}"]

    extra = [
        f"🚚 {email_order.delivery}" if email_order.delivery else "",
        f"📍 {email_order.address}" if email_order.address else "",
        f"💳 {email_order.payment}" if email_order.payment else "",
        f"📝 {email_order.comment}" if email_order.comment else "",
    ]
    extra = [x for x in extra if x]
    if extra:
        lines += [""] + extra

    links = chat_links(phone)
    if links:
        lines += ["", "💬 " + " | ".join(f"{k}: {v}" for k, v in links.items())]

    if st == "session_expired":
        lines += ["", "⚠️ Сесія адмінки закінчилась — оновіть cookie в адмінці сервісу, "
                      "щоб отримувати розміри."]
    elif st in ("error", "not_found"):
        lines += ["", "⚠️ Не вдалося отримати деталі замовлення з сайту."]
    return "\n".join(lines)
