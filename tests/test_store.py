import sqlite3

from app.store import Store


def test_sent_and_dedupe(tmp_path):
    s = Store(tmp_path / "ola.db")
    assert not s.is_sent("CD109")
    s.record_sent("CD109", "<m1>", "text")
    assert s.is_sent("CD109")
    assert s.counts()["sent"] == 1


def test_failures_count_up_to_failed(tmp_path):
    s = Store(tmp_path / "ola.db")
    assert s.record_failure("A1", None, "boom", max_attempts=3) == 1
    assert s.record_failure("A1", None, "boom", max_attempts=3) == 2
    assert s.get_order("A1")["status"] == "retry"
    assert s.record_failure("A1", None, "boom", max_attempts=3) == 3
    assert s.get_order("A1")["status"] == "failed"
    assert not s.is_sent("A1")
    s.record_sent("A1", None, "text")  # a later success still counts
    assert s.is_sent("A1") and s.get_order("A1")["last_error"] is None


def test_prune_by_age(tmp_path):
    s = Store(tmp_path / "ola.db")
    s.record_sent("OLD", None, "x")
    s.record_sent("NEW", None, "x")
    with sqlite3.connect(s.path) as c:
        c.execute("UPDATE orders SET updated_at='2000-01-01T00:00:00+00:00' WHERE number='OLD'")
    out = s.prune(retention_days=30, max_size_bytes=10**9)
    assert out["expired"] == 1
    assert s.get_order("OLD") is None and s.get_order("NEW")


def test_prune_by_size(tmp_path):
    s = Store(tmp_path / "ola.db")
    for i in range(400):
        s.record_sent(f"N{i:04d}", None, "x" * 2000)
    before = s.size_bytes()
    out = s.prune(retention_days=3650, max_size_bytes=before // 3)
    assert out["trimmed"] > 0
    assert s.size_bytes() <= before // 3
    assert s.get_order("N0399")  # newest kept
    assert s.get_order("N0000") is None  # oldest removed
