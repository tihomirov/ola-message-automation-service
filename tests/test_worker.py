from pathlib import Path

import pytest

from app.config import AppConfig
from app.store import Store
from app.worker import process_once

FIX = Path(__file__).parent / "fixtures"
DIRECT = (FIX / "order_email_CD109_direct.eml").read_bytes()
FORWARDED = (FIX / "order_email_CD109_forwarded.eml").read_bytes()
NOT_ORDER = (
    b"From: For Real <postman@site-x.pro>\r\nSubject: Newsletter\r\n"
    b"Content-Type: text/plain; charset=utf-8\r\n\r\nhello\r\n"
)


class FakeMailbox:
    def __init__(self, emails: dict[bytes, bytes]):
        self.emails = emails
        self.labels: dict[bytes, set[str]] = {uid: set() for uid in emails}
        self.searches = []

    def search(self, senders, exclude_labels, days):
        self.searches.append((senders, exclude_labels, days))
        return [u for u in self.emails if not (self.labels[u] & set(exclude_labels))]

    def fetch(self, uid):
        return self.emails[uid]

    def add_label(self, uid, label):
        self.labels[uid].add(label)


class FakeMailer:
    def __init__(self, fail_times=0):
        self.sent = []
        self.fail_times = fail_times

    def send(self, subject, text):
        if self.fail_times:
            self.fail_times -= 1
            raise OSError("smtp down")
        self.sent.append((subject, text))


@pytest.fixture
def cfg():
    c = AppConfig()
    c.mailbox.enabled = True
    c.mailbox.lookback_days = 3
    c.email.enabled = True
    c.email.to = ["me@x.com"]
    c.mailbox.max_attempts = 2
    return c


@pytest.fixture
def store(tmp_path):
    return Store(tmp_path / "ola.db")


def test_sends_order_and_labels_processed(cfg, store):
    mb, mailer = FakeMailbox({b"1": DIRECT}), FakeMailer()
    res = process_once(cfg, mb, mailer, store)
    assert (res.found, res.sent) == (1, 1)
    subject, text = mailer.sent[0]
    assert subject == "[OLA.SERVICE] Нове замовлення №CD109 — Олена Тестова"
    assert text.startswith("Олена, вітаємо") and "\n шовковиста нічна сорочка зі шнурівкою\n" in text
    assert mb.labels[b"1"] == {"ola-processed"}
    assert store.is_sent("CD109")
    senders, exclude, days = mb.searches[0]
    assert senders == ["postman@site-x.pro"] and days == 3
    assert exclude == ["ola-processed", "ola-ignored", "ola-failed"]
    # next poll: nothing new
    assert process_once(cfg, mb, mailer, store).found == 0


def test_manual_forward_needs_allowed_forwarder(cfg, store):
    mb, mailer = FakeMailbox({b"1": FORWARDED}), FakeMailer()
    res = process_once(cfg, mb, mailer, store)
    assert res.ignored == 1 and mailer.sent == []
    assert mb.labels[b"1"] == {"ola-ignored"}

    cfg.mailbox.allowed_forwarders = ["shop-owner@example.com"]
    mb2 = FakeMailbox({b"2": FORWARDED})
    res = process_once(cfg, mb2, mailer, store)
    assert res.sent == 1
    assert mb2.searches[0][0] == ["postman@site-x.pro", "shop-owner@example.com"]


def test_same_order_twice_is_sent_once(cfg, store):
    cfg.mailbox.allowed_forwarders = ["shop-owner@example.com"]
    mb, mailer = FakeMailbox({b"1": DIRECT, b"2": FORWARDED}), FakeMailer()
    res = process_once(cfg, mb, mailer, store)
    assert (res.sent, res.duplicates) == (1, 1)
    assert len(mailer.sent) == 1
    assert mb.labels[b"2"] == {"ola-processed"}


def test_non_order_email_is_ignored(cfg, store):
    mb, mailer = FakeMailbox({b"1": NOT_ORDER}), FakeMailer()
    res = process_once(cfg, mb, mailer, store)
    assert res.ignored == 1 and mb.labels[b"1"] == {"ola-ignored"}
    assert store.counts()["ignored"] == 1


def test_send_failure_retries_then_labels_failed(cfg, store):
    mb = FakeMailbox({b"1": DIRECT})
    res = process_once(cfg, mb, FakeMailer(fail_times=5), store)
    assert res.retry == 1 and mb.labels[b"1"] == set()  # unlabeled -> retried next poll
    res = process_once(cfg, mb, FakeMailer(fail_times=5), store)
    assert res.failed == 1 and mb.labels[b"1"] == {"ola-failed"}
    assert store.get_order("CD109")["status"] == "failed"


def test_send_recovers_on_next_poll(cfg, store):
    mb = FakeMailbox({b"1": DIRECT})
    process_once(cfg, mb, FakeMailer(fail_times=1), store)
    mailer = FakeMailer()
    res = process_once(cfg, mb, mailer, store)
    assert res.sent == 1 and store.is_sent("CD109")


def test_dry_run_has_no_side_effects(cfg, store):
    mb, mailer = FakeMailbox({b"1": DIRECT, b"2": NOT_ORDER}), FakeMailer()
    res = process_once(cfg, mb, mailer, store, dry_run=True)
    assert len(res.previews) == 1 and res.ignored == 1
    assert mailer.sent == [] and all(not v for v in mb.labels.values())
    assert not store.is_sent("CD109") and store.counts().get("ignored") == 0
