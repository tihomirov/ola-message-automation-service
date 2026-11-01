from datetime import date

from app.config import AppConfig
from app.mailbox import gmail_query, imap_criteria
from app.mailer import SmtpMailer, render_subject, text_to_html


def test_gmail_query():
    q = gmail_query(["postman@site-x.pro", "owner@gmail.com"], ["ola-processed", "ola-ignored"], 2)
    assert q == "(from:postman@site-x.pro OR from:owner@gmail.com) -label:ola-processed -label:ola-ignored newer_than:2d"


def test_imap_criteria():
    c = imap_criteria(["a@x", "b@x", "c@x"], ["ola-processed"], 2, today=date(2026, 11, 1))
    assert c == ["SINCE", "30-Oct-2026", "UNKEYWORD", "ola-processed",
                 "OR", "FROM", '"a@x"', "OR", "FROM", '"b@x"', "FROM", '"c@x"']


def test_render_subject():
    t = "🛍 №{number} — {customer_name} {unknown}"
    assert render_subject(t, {"number": "CD109", "customer_name": None}) == "🛍 №CD109 —  "
    assert render_subject("{broken", {"number": "A1"}) == "🛍 Нове замовлення №A1"


def test_text_to_html_links():
    h = text_to_html("Hi <b>\n💬 Telegram: https://t.me/+380 | Viber: viber://chat?number=%2B380")
    assert '<a href="https://t.me/+380">' in h and '<a href="viber://chat?number=%2B380">' in h
    assert "&lt;b&gt;" in h


class FakeSMTP:
    sent = []

    def __init__(self, host, port):
        self.calls = [("connect", host, port)]

    def __enter__(self):
        return self

    def __exit__(self, *a):
        pass

    def starttls(self):
        self.calls.append(("starttls",))

    def login(self, u, p):
        self.calls.append(("login", u, p))

    def send_message(self, msg):
        FakeSMTP.sent.append((self.calls, msg))


def test_smtp_mailer_builds_and_sends():
    cfg = AppConfig()
    cfg.mailbox.username, cfg.mailbox.password = "bot@gmail.com", "app-pw"
    cfg.email.to = ["me@x.com", "you@x.com"]
    SmtpMailer(cfg, smtp_factory=FakeSMTP).send("Subj", "line 1\nhttps://wa.me/380")
    calls, msg = FakeSMTP.sent[-1]
    assert ("starttls",) in calls and ("login", "bot@gmail.com", "app-pw") in calls
    assert msg["To"] == "me@x.com, you@x.com" and msg["Subject"] == "Subj"
    assert "bot@gmail.com" in msg["From"]
    assert msg.get_body(("plain",)).get_content().startswith("line 1")
    assert '<a href="https://wa.me/380">' in msg.get_body(("html",)).get_content()
