"""Feature flags: config.yaml (features.*), overridable by environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass

from .config import AppConfig, load_config


def _env_bool(name: str) -> bool | None:
    value = os.environ.get(name)
    if value is None or not value.strip():
        return None
    return value.strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Features:
    # OFF (default) = flow 1: the message is built from the order email alone.
    # ON            = flow 2: also fetch order details (sizes, phone...) from the
    #                 shop admin (app/shop_client.py) before building the message.
    #                 Shop settings/status in the UI are shown only when ON.
    fetch_order_details: bool = False


def load_features(cfg: AppConfig | None = None) -> Features:
    cfg = cfg or load_config()
    env = _env_bool("OLA_FETCH_ORDER_DETAILS")
    return Features(
        fetch_order_details=cfg.features.fetch_order_details if env is None else env
    )
