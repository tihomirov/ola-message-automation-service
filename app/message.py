"""Builds the notification text. Hardcoded template for the MVP.

If the shop session is expired, sizes are unknown and SIZE_PLACEHOLDER is used,
plus a warning line telling the operator to refresh the cookie in the admin.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from urllib.parse import quote

from .shop_client import FetchStatus, OrderDetails

SIZE_PLACEHOLDER = "❓ уточнити!!!"


@dataclass
class EmailOrder:
    """What we can always get from the order email itself (no site access)."""

    number: str
    customer_name: str
    phone: str | None
    items: list[str] = field(default_factory=list)  # raw item lines
    total: str | None = None


def phone_digits(phone: str | None) -> str | None:
    if not phone:
        return None
    digits = re.sub(r"\D", "", phone)
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
    status: FetchStatus,
    details: OrderDetails | None,
) -> str:
    name = (details.customer_name if details else "") or email_order.customer_name
    phone = (details.phone if details else None) or email_order.phone

    lines = [f"🛍 Нове замовлення №{email_order.number}", f"👤 {name}"]
    if phone:
        lines.append(f"📞 {phone}")
    lines.append("")

    if status == FetchStatus.OK and details:
        for it in details.items:
            size = it.size or SIZE_PLACEHOLDER
            lines.append(f"• {it.name} — розмір: {size} (x{it.count})")
    else:
        for raw in email_order.items or ["(товари див. у листі)"]:
            lines.append(f"• {raw} — розмір: {SIZE_PLACEHOLDER}")

    total = (f"{details.total} {details.currency}" if details else email_order.total)
    if total:
        lines += ["", f"💰 Всього: {total}"]

    links = chat_links(phone)
    if links:
        lines += ["", "💬 " + " | ".join(f"{k}: {v}" for k, v in links.items())]

    if status == FetchStatus.SESSION_EXPIRED:
        lines += ["", "⚠️ Сесія адмінки закінчилась — оновіть cookie в адмінці сервісу, "
                      "щоб отримувати розміри."]
    elif status in (FetchStatus.ERROR, FetchStatus.NOT_FOUND):
        lines += ["", "⚠️ Не вдалося отримати деталі замовлення з сайту."]
    return "\n".join(lines)
