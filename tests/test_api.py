import secrets

import pytest
import yaml
from fastapi.testclient import TestClient

from app import auth
from app.config import MASK, load_config, save_config


@pytest.fixture
def cfg_path(tmp_path, monkeypatch):
    p = tmp_path / "config.yaml"
    monkeypatch.setenv("OLA_CONFIG", str(p))
    monkeypatch.setenv("OLA_DATA_DIR", str(tmp_path / "data"))
    cfg = load_config(p)
    cfg.admin.password_hash = auth.hash_password("correct-horse")
    cfg.admin.session_secret = secrets.token_urlsafe(16)
    cfg.storage.db_path = str(tmp_path / "ola.db")
    cfg.mailbox.password = "imap-secret"
    save_config(cfg, p)
    return p


@pytest.fixture
def client(cfg_path, monkeypatch):
    monkeypatch.setattr(auth.time, "time", __import__("time").time)
    from app.main import app
    with TestClient(app) as c:
        yield c


def login(c):
    r = c.post("/api/auth/login", json={"password": "correct-horse"})
    assert r.status_code == 200, r.text


def test_auth_flow(client, monkeypatch):
    monkeypatch.setattr("app.api.time.sleep", lambda s: None)
    assert client.get("/api/auth/me").json() == {"configured": True, "logged_in": False}
    assert client.get("/api/config").status_code == 401
    assert client.post("/api/auth/login", json={"password": "nope"}).status_code == 401
    login(client)
    assert client.get("/api/auth/me").json()["logged_in"] is True
    assert client.get("/api/meta").json()["fetch_order_details"] is False
    client.post("/api/auth/logout")
    assert client.get("/api/config").status_code == 401


def test_config_file_is_private(cfg_path):
    assert oct(cfg_path.stat().st_mode & 0o777) == "0o600"


def test_config_masks_secrets_and_keeps_them(client, cfg_path):
    login(client)
    body = client.get("/api/config").json()
    assert "admin" not in body["config"]
    assert body["config"]["mailbox"]["password"] == MASK
    assert body["config"]["email"]["password"] == ""

    r = client.put("/api/config", json={
        "mailbox": {"username": "bot@gmail.com", "password": MASK, "poll_interval_seconds": 30},
        "features": {"fetch_order_details": True},
    })
    assert r.status_code == 200, r.text
    saved = yaml.safe_load(cfg_path.read_text())
    assert saved["mailbox"]["password"] == "imap-secret"  # MASK keeps the old value
    assert saved["mailbox"]["username"] == "bot@gmail.com"
    assert saved["mailbox"]["poll_interval_seconds"] == 30
    assert saved["admin"]["password_hash"].startswith("scrypt$")  # untouched
    assert client.get("/api/meta").json()["fetch_order_details"] is True


def test_config_validation_and_admin_protection(client):
    login(client)
    assert client.put("/api/config", json={"mailbox": {"port": "abc"}}).status_code == 422
    assert client.put("/api/config", json={"admin": {"password_hash": "x"}}).status_code == 422
    assert client.put("/api/config", json={"nope": {}}).status_code == 422


def test_orders_and_template_preview(client, cfg_path):
    from app.store import Store
    login(client)
    store = Store(load_config(cfg_path).db_file())
    store.record_sent("A1", "<m>", "hello", data={
        "number": "A1", "customer_name": "Ірина", "phone": "0671112233", "items": ["x (1 ₴ x 1)"],
        "total": "1 ₴", "item_details": [{"name": "Піжама", "price": "1 ₴", "qty": 1, "sum": "1 ₴"}]})
    r = client.get("/api/orders").json()
    assert r["total"] == 1 and r["items"][0]["number"] == "A1"
    assert client.get("/api/orders/A1").json()["data"]["customer_name"] == "Ірина"
    assert client.get("/api/orders/NOPE").status_code == 404

    default = client.get("/api/template/default").json()
    p = client.post("/api/template/preview", json={"text": default["text"], "number": "A1"}).json()
    assert p["error"] is None and p["source"] == "order A1"
    assert p["text"].startswith("Ірина, вітаємо") and "\n піжама\n" in p["text"]
    assert "border-left" in p["html"]
    assert "https://wa.me/380671112233" in p["text"]  # 0XX normalised to 380...

    bad = client.post("/api/template/preview", json={"text": "{{ order.nope }}"}).json()
    assert bad["error"] and "nope" in bad["error"]
    sample = client.post("/api/template/preview", json={"text": ""}).json()
    assert sample["text"] == client.post("/api/template/preview", json={"text": default["text"]}).json()["text"]
    assert sample["subject"] == "[OLA.SERVICE] Нове замовлення №CD109 — Олена Тестова"
    assert default["subject"].startswith("[OLA.SERVICE]")


def test_shop_test_hidden_in_flow1(client):
    login(client)
    assert client.post("/api/actions/shop-test", json={"number": "A1"}).status_code == 409


def test_status_endpoint(client, monkeypatch):
    from app import main
    monkeypatch.setattr(main, "check_network", lambda: [])
    login(client)
    s = client.get("/api/system/status").json()
    assert s["mode"] == "flow1" and "worker" in s and "heartbeat" in s


def test_spa_fallback(client, tmp_path, monkeypatch):
    from app import main
    static = tmp_path / "static"
    monkeypatch.setattr(main, "STATIC_DIR", static)
    assert "OLA message service" in client.get("/").text  # no build yet -> status page
    static.mkdir()
    (static / "index.html").write_text("<app-root></app-root>")
    (static / "main-ABC123.js").write_text("js")
    monkeypatch.setattr(main, "STATIC_DIR", static)
    assert client.get("/").text == "<app-root></app-root>"
    assert client.get("/orders/A1").text == "<app-root></app-root>"  # deep link
    r = client.get("/main-ABC123.js")
    assert r.text == "js" and "immutable" in r.headers["cache-control"]
    assert client.get("/api/unknown").status_code == 404
    assert client.get("/../config.yaml").status_code in (200, 404)
    assert "imap-secret" not in client.get("/../config.yaml").text
