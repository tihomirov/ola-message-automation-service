import pytest


@pytest.fixture(autouse=True)
def _isolated_config(tmp_path, monkeypatch):
    """Never read the developer's real config.yaml in tests."""
    monkeypatch.setenv("OLA_CONFIG", str(tmp_path / "missing-config.yaml"))
    monkeypatch.delenv("OLA_FETCH_ORDER_DETAILS", raising=False)
