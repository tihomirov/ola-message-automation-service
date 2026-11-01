"""Turns one order email into the notification text.

Flow 1 (default, Features.fetch_order_details = False):
    order email -> message + links            (shop client is never imported or called)

Flow 2 (Features.fetch_order_details = True):
    order email -> shop lookup by number -> order details -> message + links
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Protocol

from .message import EmailOrder, build_message
from .settings import Features

if TYPE_CHECKING:
    from .config import AppConfig

if TYPE_CHECKING:  # flow 2 only; not imported at runtime in flow 1
    from .shop_client import FetchResult


class OrderFetcher(Protocol):
    def fetch_order_by_number(self, number: str) -> "FetchResult": ...


@dataclass
class Notification:
    text: str
    fetch_status: str | None  # None in flow 1
    needs_size: bool  # flow 2: sizes missing -> Gmail label "needs-size" + Retry later


def _text(cfg: "AppConfig | None", order: EmailOrder, details=None, status=None) -> str:
    if cfg is None:
        return build_message(order, status, details)
    from .render import render_message
    return render_message(cfg, order, details, status)


def build_notification(
    email_order: EmailOrder,
    features: Features,
    fetcher: OrderFetcher | None = None,
    cfg: "AppConfig | None" = None,
) -> Notification:
    """cfg given -> the configurable template (render.py); None -> built-in message."""
    if not features.fetch_order_details:
        return Notification(_text(cfg, email_order), fetch_status=None, needs_size=False)

    # ---- flow 2: order details from the shop admin
    from .shop_client import FetchStatus

    if fetcher is None:
        raise ValueError("fetch_order_details is ON but no shop client is configured")
    res = fetcher.fetch_order_by_number(email_order.number)
    text = _text(cfg, email_order, res.order, res.status)
    needs_size = res.status != FetchStatus.OK or any(
        it.size is None for it in (res.order.items if res.order else [])
    )
    return Notification(text, fetch_status=res.status.value, needs_size=needs_size)
