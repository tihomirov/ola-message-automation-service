"""SQLite history: which orders were sent, failures, ignored emails.

Used for dedupe (one notification per order number), retries and the status
page. Size is capped: rows older than retention_days are deleted, and if the
file is still over max_size_mb the oldest rows go and the file is VACUUMed.
"""

from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS orders (
    number       TEXT PRIMARY KEY,
    message_id   TEXT,
    status       TEXT NOT NULL,          -- sent | retry | failed
    attempts     INTEGER NOT NULL DEFAULT 0,
    fetch_status TEXT,                   -- flow 2 only
    message      TEXT,
    last_error   TEXT,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ignored (
    message_id TEXT PRIMARY KEY,
    reason     TEXT,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_updated ON orders(updated_at);
"""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class Store:
    def __init__(self, path: Path | str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        with self._conn() as c:
            c.execute("PRAGMA journal_mode=WAL")
            c.executescript(SCHEMA)
            cols = {r[1] for r in c.execute("PRAGMA table_info(orders)")}
            if "data" not in cols:  # added after the first release
                c.execute("ALTER TABLE orders ADD COLUMN data TEXT")

    def _conn(self) -> sqlite3.Connection:
        c = sqlite3.connect(self.path, timeout=10)
        c.row_factory = sqlite3.Row
        return c

    def _exec(self, sql: str, args: tuple = ()) -> list[sqlite3.Row]:
        with self._lock, self._conn() as c:
            return c.execute(sql, args).fetchall()

    # ---- orders
    def is_sent(self, number: str) -> bool:
        rows = self._exec("SELECT 1 FROM orders WHERE number=? AND status='sent'", (number,))
        return bool(rows)

    def record_sent(self, number: str, message_id: str | None, message: str,
                    fetch_status: str | None = None, data: dict | None = None) -> None:
        now = _now()
        blob = json.dumps(data, ensure_ascii=False) if data is not None else None
        self._exec(
            """INSERT INTO orders(number, message_id, status, attempts, fetch_status, message,
                                  last_error, data, created_at, updated_at)
               VALUES(?, ?, 'sent', 1, ?, ?, NULL, ?, ?, ?)
               ON CONFLICT(number) DO UPDATE SET status='sent', attempts=attempts+1,
                   message_id=excluded.message_id, fetch_status=excluded.fetch_status,
                   message=excluded.message, last_error=NULL,
                   data=COALESCE(excluded.data, data), updated_at=excluded.updated_at""",
            (number, message_id, fetch_status, message, blob, now, now),
        )

    def record_failure(self, number: str, message_id: str | None, error: str,
                       max_attempts: int) -> int:
        """Store a failed send; returns the attempt count. status becomes 'failed' at max."""
        now = _now()
        with self._lock, self._conn() as c:
            c.execute(
                """INSERT INTO orders(number, message_id, status, attempts, last_error,
                                      created_at, updated_at)
                   VALUES(?, ?, 'retry', 1, ?, ?, ?)
                   ON CONFLICT(number) DO UPDATE SET attempts=attempts+1,
                       last_error=excluded.last_error, updated_at=excluded.updated_at""",
                (number, message_id, error[:500], now, now),
            )
            attempts = c.execute("SELECT attempts FROM orders WHERE number=?", (number,)).fetchone()[0]
            if attempts >= max_attempts:
                c.execute("UPDATE orders SET status='failed' WHERE number=?", (number,))
            return attempts

    def mark_ignored(self, message_id: str, reason: str) -> None:
        self._exec(
            "INSERT OR REPLACE INTO ignored(message_id, reason, created_at) VALUES(?, ?, ?)",
            (message_id, reason[:500], _now()),
        )

    def get_order(self, number: str) -> dict | None:
        rows = self._exec("SELECT * FROM orders WHERE number=?", (number,))
        if not rows:
            return None
        d = dict(rows[0])
        d["data"] = json.loads(d["data"]) if d.get("data") else None
        return d

    def recent(self, limit: int = 20, offset: int = 0, status: str | None = None) -> list[dict]:
        where, args = ("WHERE status=?", (status,)) if status else ("", ())
        return [dict(r) for r in self._exec(
            "SELECT number, status, attempts, fetch_status, last_error, created_at, updated_at "
            f"FROM orders {where} ORDER BY updated_at DESC LIMIT ? OFFSET ?",
            (*args, limit, offset))]

    def total(self, status: str | None = None) -> int:
        where, args = ("WHERE status=?", (status,)) if status else ("", ())
        return self._exec(f"SELECT COUNT(*) n FROM orders {where}", args)[0]["n"]

    def counts(self) -> dict:
        rows = self._exec("SELECT status, COUNT(*) n FROM orders GROUP BY status")
        out = {r["status"]: r["n"] for r in rows}
        out["ignored"] = self._exec("SELECT COUNT(*) n FROM ignored")[0]["n"]
        return out

    # ---- size control
    def size_bytes(self) -> int:
        total = 0
        for suffix in ("", "-wal", "-shm"):
            p = Path(str(self.path) + suffix)
            if p.exists():
                total += p.stat().st_size
        return total

    def prune(self, retention_days: int, max_size_bytes: int) -> dict:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=retention_days)).isoformat(
            timespec="seconds")
        with self._lock, self._conn() as c:
            old = c.execute("DELETE FROM orders WHERE updated_at < ?", (cutoff,)).rowcount
            old += c.execute("DELETE FROM ignored WHERE created_at < ?", (cutoff,)).rowcount
        trimmed = 0
        for _ in range(10):  # each round removes the oldest ~25%
            if self.size_bytes() <= max_size_bytes:
                break
            with self._lock, self._conn() as c:
                for table, col in (("orders", "updated_at"), ("ignored", "created_at")):
                    n = c.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
                    k = max(1, n // 4) if n else 0
                    if k:
                        trimmed += c.execute(
                            f"DELETE FROM {table} WHERE rowid IN "
                            f"(SELECT rowid FROM {table} ORDER BY {col} LIMIT ?)", (k,)).rowcount
            self.vacuum()
        if old and not trimmed:
            self.vacuum()
        return {"expired": old, "trimmed": trimmed, "size_bytes": self.size_bytes()}

    def vacuum(self) -> None:
        with self._lock:
            c = sqlite3.connect(self.path, timeout=10, isolation_level=None)
            try:
                c.execute("PRAGMA wal_checkpoint(TRUNCATE)")
                c.execute("VACUUM")
            finally:
                c.close()
