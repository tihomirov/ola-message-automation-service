"""Owns the running mail worker: start on boot, restart after a settings save."""

from __future__ import annotations

import logging
import threading

from . import worker as worker_mod
from .config import ConfigError, load_config

log = logging.getLogger("ola")
_lock = threading.Lock()
_worker: worker_mod.Worker | None = None


def start_worker() -> None:
    global _worker
    with _lock:
        try:
            cfg = load_config()
        except ConfigError as e:
            worker_mod.STATE.problems = [f"config.yaml: {e}"]
            log.error("mail worker not started: %s", e)
            return
        worker_mod.STATE.problems = cfg.problems()
        if worker_mod.STATE.problems:
            log.warning("mail worker not started: %s", "; ".join(worker_mod.STATE.problems))
            return
        _worker = worker_mod.Worker(cfg)
        _worker.start()


def stop_worker() -> None:
    global _worker
    with _lock:
        if _worker:
            _worker.stop()
            _worker = None
        worker_mod.STATE.running = False


def restart_worker() -> None:
    stop_worker()
    start_worker()
