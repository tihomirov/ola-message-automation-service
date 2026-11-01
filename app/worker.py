"""Mail worker: polls the mailbox, builds notifications, sends them by email.

    every mailbox.poll_interval_seconds:
        search emails from allowed senders/forwarders, newer than lookback_days,
        without the processed/ignored/failed labels
        for each (oldest first):
            not an order email   -> label "ignored"
            order already sent   -> label "processed" (no duplicate)
            otherwise            -> build message (flow 1 or 2) -> send email
                                    ok: label "processed"; error: retry next poll,
                                    after max_attempts label "failed"

Manual run:  python -m app.worker --once [--dry-run]
             python -m app.worker --test-email
"""

from __future__ import annotations

import hashlib
import logging
import threading
import time
from dataclasses import asdict, dataclass, field
from typing import Protocol

from .config import AppConfig
from .email_parser import NotAnOrderEmail, parse_order_email
from .mailer import render_subject
from .pipeline import build_notification
from .settings import load_features
from .store import Store

log = logging.getLogger("ola.worker")


class Mailbox(Protocol):
    def search(self, senders: list[str], exclude_labels: list[str], days: int) -> list[bytes]: ...
    def fetch(self, uid: bytes) -> bytes: ...
    def add_label(self, uid: bytes, label: str) -> None: ...


class Mailer(Protocol):
    def send(self, subject: str, text: str) -> None: ...


@dataclass
class PollResult:
    found: int = 0
    sent: int = 0
    duplicates: int = 0
    ignored: int = 0
    retry: int = 0
    failed: int = 0
    previews: list[tuple[str, str]] = field(default_factory=list)  # dry run


@dataclass
class WorkerState:
    running: bool = False
    problems: list[str] = field(default_factory=list)
    last_poll_at: float | None = None
    last_ok_at: float | None = None
    last_error: str = ""
    last_result: PollResult | None = None


STATE = WorkerState()


def process_once(cfg: AppConfig, mailbox: Mailbox, mailer: Mailer | None, store: Store,
                 fetcher=None, dry_run: bool = False) -> PollResult:
    mb = cfg.mailbox
    features = load_features(cfg)
    res = PollResult()
    senders = list(dict.fromkeys(mb.allowed_senders + mb.allowed_forwarders))
    uids = mailbox.search(senders, [mb.processed_label, mb.ignored_label, mb.failed_label],
                          mb.lookback_days)
    res.found = len(uids)
    for uid in uids:
        raw = mailbox.fetch(uid)
        try:
            parsed = parse_order_email(raw, senders=mb.allowed_senders,
                                       forwarders=mb.allowed_forwarders)
        except NotAnOrderEmail as e:
            res.ignored += 1
            log.info("UID %s ignored: %s", uid.decode(), e)
            if not dry_run:
                key = hashlib.sha256(raw).hexdigest()[:32]
                store.mark_ignored(key, str(e))
                mailbox.add_label(uid, mb.ignored_label)
            continue

        order = parsed.order
        if store.is_sent(order.number):
            res.duplicates += 1
            log.info("order %s already sent, skipping", order.number)
            if not dry_run:
                mailbox.add_label(uid, mb.processed_label)
            continue

        note = build_notification(order, features, fetcher, cfg)
        subject = render_subject(cfg.email.subject, vars(order))
        if dry_run:
            res.previews.append((subject, note.text))
            continue
        if mailer is None:
            raise RuntimeError("no channel configured")
        try:
            mailer.send(subject, note.text)
        except Exception as e:  # SMTP/network errors -> retry on the next poll
            attempts = store.record_failure(order.number, parsed.message_id,
                                            f"{type(e).__name__}: {e}", mb.max_attempts)
            log.warning("order %s: send failed (attempt %d/%d): %s",
                        order.number, attempts, mb.max_attempts, e)
            if attempts >= mb.max_attempts:
                res.failed += 1
                mailbox.add_label(uid, mb.failed_label)
            else:
                res.retry += 1
            continue
        store.record_sent(order.number, parsed.message_id, note.text, note.fetch_status,
                          data=asdict(order))
        mailbox.add_label(uid, mb.processed_label)
        res.sent += 1
        log.info("order %s: notification sent", order.number)
    return res


def make_fetcher(cfg: AppConfig):
    """Shop client for flow 2, or None for flow 1 (shop code is not imported then)."""
    if not load_features(cfg).fetch_order_details:
        return None
    from .shop_client import ShopClient, ShopConfig
    return ShopClient(ShopConfig(base_url=cfg.shop.base_url, cookie=cfg.shop.cookie,
                                 login_email=cfg.shop.login_email,
                                 login_password=cfg.shop.login_password))


class Worker:
    PRUNE_EVERY = 3600

    def __init__(self, cfg: AppConfig):
        from .mailer import SmtpMailer
        self.cfg = cfg
        self.store = Store(cfg.db_file())
        self.mailer = SmtpMailer(cfg)
        self.fetcher = make_fetcher(cfg)
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._last_prune = 0.0

    def poll(self, dry_run: bool = False) -> PollResult:
        from .mailbox import ImapMailbox
        with ImapMailbox(self.cfg.mailbox) as mb:
            res = process_once(self.cfg, mb, self.mailer, self.store, self.fetcher, dry_run)
        if not dry_run and time.time() - self._last_prune > self.PRUNE_EVERY:
            self._last_prune = time.time()
            self.store.prune(self.cfg.storage.retention_days,
                             self.cfg.storage.max_size_mb * 1024 * 1024)
        return res

    def _loop(self) -> None:
        while not self._stop.is_set():
            STATE.last_poll_at = time.time()
            try:
                STATE.last_result = self.poll()
                STATE.last_ok_at = time.time()
                STATE.last_error = ""
            except Exception as e:
                STATE.last_error = f"{type(e).__name__}: {e}"
                log.error("poll failed: %s", STATE.last_error)
            self._stop.wait(self.cfg.mailbox.poll_interval_seconds)

    def start(self) -> None:
        STATE.running = True
        self._thread = threading.Thread(target=self._loop, name="ola-worker", daemon=True)
        self._thread.start()
        log.info("mail worker started: every %ss", self.cfg.mailbox.poll_interval_seconds)

    def stop(self) -> None:
        self._stop.set()
        STATE.running = False


# ------------------------------------------------------------------ CLI
def _main() -> None:
    import argparse

    from .config import load_config
    from .mailer import SmtpMailer

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    ap = argparse.ArgumentParser(description="OLA mail worker (manual run)")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--once", action="store_true", help="poll the mailbox once")
    g.add_argument("--test-email", action="store_true", help="send a test email")
    ap.add_argument("--dry-run", action="store_true",
                    help="with --once: only print the messages; no sending, no labels")
    args = ap.parse_args()

    cfg = load_config()
    if args.test_email:
        problems = [p for p in cfg.problems() if p.startswith(("email", "SMTP", "no channel"))]
        if problems:
            raise SystemExit("Config problems:\n  - " + "\n  - ".join(problems))
        SmtpMailer(cfg).send("✅ OLA service: test email", "If you can read this, the email channel works.")
        print("Test email sent to:", ", ".join(cfg.email.to))
        return

    problems = [p for p in cfg.problems() if not (args.dry_run and p.startswith(("email", "SMTP", "no channel")))]
    if problems:
        raise SystemExit("Config problems:\n  - " + "\n  - ".join(problems))
    res = Worker(cfg).poll(dry_run=args.dry_run)
    for subject, text in res.previews:
        print("=" * 60, f"\nSubject: {subject}\n\n{text}\n")
    print(f"found={res.found} sent={res.sent} duplicates={res.duplicates} "
          f"ignored={res.ignored} retry={res.retry} failed={res.failed}"
          + (" (dry run)" if args.dry_run else ""))


if __name__ == "__main__":
    _main()
