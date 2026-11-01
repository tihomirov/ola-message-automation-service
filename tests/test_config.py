from pathlib import Path

import pytest

from app.config import AppConfig, ConfigError, load_config
from app.settings import load_features

EXAMPLE = Path(__file__).parent.parent / "config.example.yaml"


def test_example_config_loads():
    cfg = load_config(EXAMPLE)
    assert cfg.mailbox.host == "imap.gmail.com"
    assert cfg.mailbox.allowed_senders == ["postman@site-x.pro"]
    assert cfg.mailbox.allowed_forwarders == []
    assert cfg.email.to == ["you@example.com"]
    assert cfg.smtp_username() == cfg.mailbox.username  # empty email.username -> mailbox's
    assert cfg.features.fetch_order_details is False


def test_missing_file_gives_defaults(tmp_path):
    cfg = load_config(tmp_path / "nope.yaml")
    assert cfg == AppConfig()
    assert cfg.problems() == ["mailbox.enabled is false"]


def test_unknown_key_is_an_error(tmp_path):
    p = tmp_path / "c.yaml"
    p.write_text("mailbox:\n  usernme: x\n")
    with pytest.raises(ConfigError, match="usernme"):
        load_config(p)


def test_type_errors(tmp_path):
    p = tmp_path / "c.yaml"
    p.write_text("mailbox:\n  poll_interval_seconds: soon\n")
    with pytest.raises(ConfigError, match="poll_interval_seconds"):
        load_config(p)


def test_problems_when_enabled_but_incomplete(tmp_path):
    p = tmp_path / "c.yaml"
    p.write_text("mailbox:\n  enabled: true\nemail:\n  enabled: true\n")
    problems = load_config(p).problems()
    assert any("mailbox.username" in x for x in problems)
    assert any("email.to" in x for x in problems)


def test_complete_config_has_no_problems(tmp_path):
    p = tmp_path / "c.yaml"
    p.write_text(
        "mailbox: {enabled: true, username: bot@gmail.com, password: app}\n"
        "email: {enabled: true, to: [me@x.com]}\n"
    )
    assert load_config(p).problems() == []


def test_feature_flag_from_config_and_env(tmp_path, monkeypatch):
    p = tmp_path / "c.yaml"
    p.write_text("features: {fetch_order_details: true}\n")
    cfg = load_config(p)
    assert load_features(cfg).fetch_order_details is True
    monkeypatch.setenv("OLA_FETCH_ORDER_DETAILS", "false")
    assert load_features(cfg).fetch_order_details is False
