"""Feature flags.

For now they come from environment variables (set in the systemd unit).
In P1 they move to config.yaml and become toggles in the backoffice.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Features:
    # OFF (default) = flow 1: the message is built from the order email alone.
    # ON            = flow 2: also fetch order details (sizes, phone...) from the
    #                 shop admin (app/shop_client.py) before building the message.
    #                 Shop settings/status in the UI are shown only when ON.
    fetch_order_details: bool = False


def load_features() -> Features:
    return Features(fetch_order_details=_env_bool("OLA_FETCH_ORDER_DETAILS", False))
