"""Email channel: sends the notification via SMTP (Gmail: smtp.gmail.com + app password)."""

from __future__ import annotations

import html
import re
import smtplib
from email.message import EmailMessage
from email.utils import formataddr, make_msgid

from .config import AppConfig

URL_RE = re.compile(r"((?:https?|viber)://[^\s|]+)")


class _Missing(dict):
    def __missing__(self, key):
        return ""


def render_subject(template: str, values: dict) -> str:
    try:
        return template.format_map(_Missing({k: v or "" for k, v in values.items()}))
    except (ValueError, IndexError):  # broken template -> safe default
        return "🛍 Нове замовлення №{}".format(values.get("number", ""))


def text_to_html(text: str) -> str:
    out = []
    for line in text.split("\n"):
        parts = URL_RE.split(line)
        out.append("".join(
            f'<a href="{html.escape(p)}">{html.escape(p)}</a>' if URL_RE.fullmatch(p) else html.escape(p)
            for p in parts
        ))
    return '<div style="font-family:sans-serif;font-size:15px">' + "<br>\n".join(out) + "</div>"


class SmtpMailer:
    def __init__(self, cfg: AppConfig, smtp_factory=None):
        self.cfg = cfg
        self._factory = smtp_factory

    def send(self, subject: str, text: str) -> None:
        e = self.cfg.email
        user, password = self.cfg.smtp_username(), self.cfg.smtp_password()
        msg = EmailMessage()
        msg["From"] = formataddr((e.from_name, user))
        msg["To"] = ", ".join(e.to)
        msg["Subject"] = subject
        msg["Message-ID"] = make_msgid(domain="ola-service")
        msg.set_content(text)
        msg.add_alternative(text_to_html(text), subtype="html")

        if self._factory:
            smtp = self._factory(e.smtp_host, e.smtp_port)
        elif e.smtp_port == 465:
            smtp = smtplib.SMTP_SSL(e.smtp_host, e.smtp_port, timeout=30)
        else:
            smtp = smtplib.SMTP(e.smtp_host, e.smtp_port, timeout=30)
        with smtp:
            if e.smtp_port != 465:
                smtp.starttls()
            smtp.login(user, password)
            smtp.send_message(msg)
