"""Service configuration: config.yaml (git-ignored, chmod 600; holds secrets).

Start from config.example.yaml. Missing keys use the defaults below; unknown
keys are an error (catches typos). In P1 the backoffice edits this file.
"""

from __future__ import annotations

import os
import tempfile
from dataclasses import asdict, dataclass, field, fields, is_dataclass
from pathlib import Path
from typing import Any, get_args, get_type_hints

import yaml

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_PATH = BASE_DIR / "config.yaml"


class ConfigError(ValueError):
    pass


@dataclass
class FeaturesConfig:
    # false = flow 1 (email only); true = flow 2 (+ order details from the shop)
    fetch_order_details: bool = False


@dataclass
class MailboxConfig:
    enabled: bool = False
    host: str = "imap.gmail.com"
    port: int = 993
    username: str = ""
    password: str = ""  # Gmail: app password
    folder: str = "INBOX"
    poll_interval_seconds: int = 60
    lookback_days: int = 2  # only emails newer than this are considered
    allowed_senders: list[str] = field(default_factory=lambda: ["postman@site-x.pro"])
    allowed_forwarders: list[str] = field(default_factory=list)  # manual "Fwd:" allowed from
    processed_label: str = "ola-processed"
    ignored_label: str = "ola-ignored"
    failed_label: str = "ola-failed"
    max_attempts: int = 5  # send attempts before an email gets the failed label


@dataclass
class EmailChannelConfig:
    enabled: bool = False
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587  # 587 = STARTTLS, 465 = SSL
    username: str = ""  # empty = mailbox.username
    password: str = ""  # empty = mailbox.password
    from_name: str = "OLA замовлення"
    to: list[str] = field(default_factory=list)
    subject: str = "🛍 Нове замовлення №{number} — {customer_name}"


@dataclass
class ShopConfigSection:  # used only when features.fetch_order_details is true
    base_url: str = "https://forreal-wear.com/eco/ukr/shop"
    login_email: str = ""
    login_password: str = ""
    cookie: str = ""


@dataclass
class LinkConfig:
    name: str = ""
    url: str = ""  # Jinja template, e.g. https://wa.me/{{ customer.phone_e164 }}


def _default_links() -> list[LinkConfig]:
    return [
        LinkConfig("Telegram", "https://t.me/+{{ customer.phone_e164 }}"),
        LinkConfig("Viber", "viber://chat?number=%2B{{ customer.phone_e164 }}"),
        LinkConfig("WhatsApp", "https://wa.me/{{ customer.phone_e164 }}"),
    ]


@dataclass
class TemplateConfig:
    text: str = ""  # Jinja message template; empty = built-in message
    links: list[LinkConfig] = field(default_factory=_default_links)


@dataclass
class AdminConfig:  # set with: python -m app.cli set-password
    password_hash: str = ""
    session_secret: str = ""
    session_hours: int = 168


@dataclass
class StorageConfig:
    db_path: str = "data/ola.db"  # relative to the project folder
    max_size_mb: int = 50
    retention_days: int = 180


@dataclass
class AppConfig:
    features: FeaturesConfig = field(default_factory=FeaturesConfig)
    mailbox: MailboxConfig = field(default_factory=MailboxConfig)
    email: EmailChannelConfig = field(default_factory=EmailChannelConfig)
    shop: ShopConfigSection = field(default_factory=ShopConfigSection)
    storage: StorageConfig = field(default_factory=StorageConfig)
    template: TemplateConfig = field(default_factory=TemplateConfig)
    admin: AdminConfig = field(default_factory=AdminConfig)

    def smtp_username(self) -> str:
        return self.email.username or self.mailbox.username

    def smtp_password(self) -> str:
        return self.email.password or self.mailbox.password

    def db_file(self) -> Path:
        p = Path(self.storage.db_path)
        return p if p.is_absolute() else BASE_DIR / p

    def problems(self) -> list[str]:
        """What prevents the mail worker from running (empty list = OK)."""
        out = []
        if not self.mailbox.enabled:
            return ["mailbox.enabled is false"]
        if not (self.mailbox.username and self.mailbox.password):
            out.append("mailbox.username / mailbox.password are not set")
        if not self.mailbox.allowed_senders:
            out.append("mailbox.allowed_senders is empty")
        if self.mailbox.poll_interval_seconds < 15:
            out.append("mailbox.poll_interval_seconds must be >= 15")
        if not self.email.enabled:
            out.append("no channel enabled (email.enabled is false)")
        else:
            if not self.email.to:
                out.append("email.to is empty")
            if not (self.smtp_username() and self.smtp_password()):
                out.append("SMTP credentials are not set (email.* or mailbox.*)")
        if self.features.fetch_order_details and not (
            (self.shop.login_email and self.shop.login_password) or self.shop.cookie
        ):
            out.append("flow 2 is on but shop.login_* or shop.cookie is not set")
        return out


def _build(cls: type, data: Any, path: str) -> Any:
    if data is None:
        return cls()
    if not isinstance(data, dict):
        raise ConfigError(f"{path or 'config'}: expected a mapping")
    hints = get_type_hints(cls)
    known = {f.name for f in fields(cls)}
    unknown = set(data) - known
    if unknown:
        raise ConfigError(f"{path or 'config'}: unknown key(s): {', '.join(sorted(unknown))}")
    kwargs = {}
    for name, value in data.items():
        t = hints[name]
        key = f"{path}.{name}" if path else name
        if is_dataclass(t):
            kwargs[name] = _build(t, value, key)
        elif t is bool:
            if not isinstance(value, bool):
                raise ConfigError(f"{key}: expected true/false")
            kwargs[name] = value
        elif t is int:
            if isinstance(value, bool) or not isinstance(value, int):
                raise ConfigError(f"{key}: expected a number")
            kwargs[name] = value
        elif t is str:
            kwargs[name] = "" if value is None else str(value)
        else:  # list[str] or list[<dataclass>]
            if value is None:
                value = []
            if not isinstance(value, list):
                raise ConfigError(f"{key}: expected a list")
            (item_t,) = get_args(t) or (str,)
            if is_dataclass(item_t):
                kwargs[name] = [_build(item_t, v, f"{key}[{i}]") for i, v in enumerate(value)]
            else:
                kwargs[name] = [str(v).strip() for v in value if str(v).strip()]
    return cls(**kwargs)


# ------------------------------------------------------------------ API helpers
MASK = "••••••"
# (section, field) pairs that are never returned by the API
SECRET_FIELDS = {
    ("mailbox", "password"),
    ("email", "password"),
    ("shop", "login_password"),
    ("shop", "cookie"),
}
HIDDEN_SECTIONS = {"admin"}  # not readable/writable through the API at all


def to_dict(cfg: AppConfig) -> dict:
    return asdict(cfg)


def masked_dict(cfg: AppConfig) -> dict:
    """Config for the UI: secrets replaced by MASK (or '' when unset), admin removed."""
    d = to_dict(cfg)
    for section in HIDDEN_SECTIONS:
        d.pop(section, None)
    for section, name in SECRET_FIELDS:
        d[section][name] = MASK if d[section][name] else ""
    return d


def merge_update(cfg: AppConfig, update: dict) -> AppConfig:
    """Apply a (partial) update from the UI. Secrets equal to MASK, missing or None
    keep their stored value; '' clears them. Raises ConfigError on bad input."""
    current = to_dict(cfg)
    for section, values in (update or {}).items():
        if section in HIDDEN_SECTIONS:
            raise ConfigError(f"{section}: cannot be changed here")
        if section not in current or not isinstance(current[section], dict):
            raise ConfigError(f"unknown section: {section}")
        if not isinstance(values, dict):
            raise ConfigError(f"{section}: expected a mapping")
        for name, value in values.items():
            if (section, name) in SECRET_FIELDS and (value is None or value == MASK):
                continue
            current[section][name] = value
    return _build(AppConfig, current, "")


def save_config(cfg: AppConfig, path: Path | str | None = None) -> None:
    """Atomic write with chmod 600 (the file holds passwords)."""
    p = Path(path) if path else config_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    text = yaml.safe_dump(to_dict(cfg), allow_unicode=True, sort_keys=False, width=120)
    fd, tmp = tempfile.mkstemp(dir=p.parent, prefix=".config-", suffix=".yaml")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write("# Written by the OLA service. Also editable by hand (restart after).\n")
            f.write(text)
        os.chmod(tmp, 0o600)
        os.replace(tmp, p)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise


def config_path() -> Path:
    return Path(os.environ.get("OLA_CONFIG", DEFAULT_PATH))


def load_config(path: Path | str | None = None) -> AppConfig:
    p = Path(path) if path else config_path()
    if not p.exists():
        return AppConfig()
    try:
        data = yaml.safe_load(p.read_text(encoding="utf-8"))
    except yaml.YAMLError as e:
        raise ConfigError(f"{p.name}: invalid YAML: {e}") from e
    return _build(AppConfig, data, "")
