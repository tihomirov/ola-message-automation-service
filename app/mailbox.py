"""IMAP access to the order mailbox.

Gmail (X-GM-EXT-1): searched with Gmail syntax and tagged with Gmail labels.
Other IMAP servers: SINCE/FROM search and IMAP keywords instead of labels.
Emails are fetched with BODY.PEEK[] so they are not marked as read.
"""

from __future__ import annotations

import imaplib
from datetime import date, timedelta

from .config import MailboxConfig

_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def gmail_query(senders: list[str], exclude_labels: list[str], days: int) -> str:
    who = " OR ".join(f"from:{s}" for s in senders)
    skip = "".join(f" -label:{lb}" for lb in exclude_labels)
    return f"({who}){skip} newer_than:{days}d"


def imap_criteria(senders: list[str], exclude_keywords: list[str], days: int,
                  today: date | None = None) -> list[str]:
    d = (today or date.today()) - timedelta(days=days)
    crit = ["SINCE", f"{d.day:02d}-{_MONTHS[d.month - 1]}-{d.year}"]
    for kw in exclude_keywords:
        crit += ["UNKEYWORD", kw]
    from_parts: list[str] = []
    for i, s in enumerate(senders):
        if i < len(senders) - 1:
            from_parts.append("OR")
        from_parts += ["FROM", f'"{s}"']
    return crit + from_parts


class MailboxError(RuntimeError):
    pass


class ImapMailbox:
    def __init__(self, cfg: MailboxConfig):
        self.cfg = cfg
        self.conn: imaplib.IMAP4_SSL | None = None
        self.gmail = False

    def __enter__(self) -> "ImapMailbox":
        try:
            self.conn = imaplib.IMAP4_SSL(self.cfg.host, self.cfg.port, timeout=30)
            self.conn.login(self.cfg.username, self.cfg.password)
        except imaplib.IMAP4.error as e:
            raise MailboxError(f"IMAP login failed: {e}") from e
        except OSError as e:
            raise MailboxError(f"IMAP connection failed: {e}") from e
        self.gmail = "X-GM-EXT-1" in self.conn.capabilities
        typ, _ = self.conn.select(f'"{self.cfg.folder}"')
        if typ != "OK":
            raise MailboxError(f"cannot open folder {self.cfg.folder!r}")
        if self.gmail:
            for label in (self.cfg.processed_label, self.cfg.ignored_label, self.cfg.failed_label):
                try:
                    self.conn.create(f'"{label}"')  # fails harmlessly if it exists
                except imaplib.IMAP4.error:
                    pass
            self.conn.select(f'"{self.cfg.folder}"')
        return self

    def __exit__(self, *exc) -> None:
        if self.conn is not None:
            try:
                self.conn.logout()
            except Exception:
                pass

    def search(self, senders: list[str], exclude_labels: list[str], days: int) -> list[bytes]:
        assert self.conn is not None
        if self.gmail:
            typ, data = self.conn.uid("SEARCH", "X-GM-RAW",
                                      f'"{gmail_query(senders, exclude_labels, days)}"')
        else:
            typ, data = self.conn.uid("SEARCH", *imap_criteria(senders, exclude_labels, days))
        if typ != "OK":
            raise MailboxError(f"IMAP search failed: {data}")
        return sorted((data[0] or b"").split(), key=int)  # oldest first

    def fetch(self, uid: bytes) -> bytes:
        assert self.conn is not None
        typ, data = self.conn.uid("FETCH", uid, "(BODY.PEEK[])")
        if typ != "OK" or not data or not isinstance(data[0], tuple):
            raise MailboxError(f"IMAP fetch of UID {uid!r} failed")
        return data[0][1]

    def add_label(self, uid: bytes, label: str) -> None:
        assert self.conn is not None
        if self.gmail:
            self.conn.uid("STORE", uid, "+X-GM-LABELS", f'("{label}")')
        else:
            self.conn.uid("STORE", uid, "+FLAGS", f"({label})")
