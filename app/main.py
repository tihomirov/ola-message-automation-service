"""Stage 0 smoke-test service.

Goal: prove that the Android Linux Terminal VM can
  1. install and run the Python stack (FastAPI + uvicorn),
  2. serve a web page reachable from the phone / LAN,
  3. reach Gmail IMAP/SMTP and the Telegram API,
  4. keep running in the background (heartbeat gaps reveal pauses/kills).
"""

from __future__ import annotations

import html
import os
import socket
import threading
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

try:
    from zoneinfo import ZoneInfo

    TZ = ZoneInfo(os.environ.get("OLA_TZ", "Europe/Kyiv"))
except Exception:  # tzdata missing -> fall back to UTC
    TZ = timezone.utc

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("OLA_DATA_DIR", BASE_DIR / "data"))
HEARTBEAT_FILE = DATA_DIR / "heartbeat.log"
INTERVAL = int(os.environ.get("OLA_HEARTBEAT_SECONDS", "30"))
GAP_THRESHOLD = INTERVAL * 3
MAX_LINES = 20_000
CHECK_TARGETS = [
    ("imap.gmail.com", 993),
    ("smtp.gmail.com", 587),
    ("api.telegram.org", 443),
]
PROCESS_STARTED = time.time()


# ---------------------------------------------------------------- heartbeat
def _trim_log() -> None:
    if not HEARTBEAT_FILE.exists():
        return
    lines = HEARTBEAT_FILE.read_text().splitlines()
    if len(lines) > MAX_LINES:
        HEARTBEAT_FILE.write_text("\n".join(lines[-MAX_LINES:]) + "\n")


def _write(kind: str) -> None:
    with HEARTBEAT_FILE.open("a") as f:
        f.write(f"{kind} {int(time.time())}\n")


def _heartbeat_loop(stop: threading.Event) -> None:
    while not stop.wait(INTERVAL):
        _write("BEAT")


@asynccontextmanager
async def lifespan(_: FastAPI):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _trim_log()
    _write("START")
    stop = threading.Event()
    threading.Thread(target=_heartbeat_loop, args=(stop,), daemon=True).start()
    yield
    stop.set()
    _write("STOP")


app = FastAPI(title="OLA message service (smoke test)", lifespan=lifespan)


# ---------------------------------------------------------------- helpers
def fmt_ts(ts: float) -> str:
    return datetime.fromtimestamp(ts, TZ).strftime("%Y-%m-%d %H:%M:%S")


def fmt_dur(seconds: float) -> str:
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    return f"{h}h {m:02d}m {s:02d}s" if h else f"{m}m {s:02d}s"


def analyse_heartbeat() -> dict:
    entries: list[tuple[str, int]] = []
    if HEARTBEAT_FILE.exists():
        for line in HEARTBEAT_FILE.read_text().splitlines():
            parts = line.split()
            if len(parts) == 2 and parts[1].isdigit():
                entries.append((parts[0], int(parts[1])))

    gaps = []
    for (_, t1), (k2, t2) in zip(entries, entries[1:]):
        delta = t2 - t1
        if delta > GAP_THRESHOLD:
            gaps.append(
                {
                    "from": t1,
                    "to": t2,
                    "seconds": delta,
                    # START after a gap = process/VM was restarted;
                    # BEAT after a gap = VM was frozen and then resumed.
                    "kind": "restarted" if k2 == "START" else "paused",
                }
            )

    span = entries[-1][1] - entries[0][1] if len(entries) > 1 else 0
    missing = sum(g["seconds"] for g in gaps)
    return {
        "first": entries[0][1] if entries else None,
        "last": entries[-1][1] if entries else None,
        "starts": sum(1 for k, _ in entries if k == "START"),
        "gaps": gaps,
        "span": span,
        "availability": (100 * (span - missing) / span) if span else 100.0,
    }


def meminfo() -> dict:
    out = {}
    try:
        for line in Path("/proc/meminfo").read_text().splitlines():
            key, val = line.split(":", 1)
            if key in ("MemTotal", "MemAvailable", "SwapTotal", "SwapFree"):
                out[key] = int(val.split()[0]) // 1024  # MiB
        for line in Path("/proc/self/status").read_text().splitlines():
            if line.startswith("VmRSS:"):
                out["ProcessRSS"] = int(line.split()[1]) // 1024
    except OSError:
        pass
    return out


def vm_uptime() -> float:
    try:
        return float(Path("/proc/uptime").read_text().split()[0])
    except OSError:
        return 0.0


def check_network() -> list[dict]:
    results = []
    for host, port in CHECK_TARGETS:
        t0 = time.monotonic()
        try:
            with socket.create_connection((host, port), timeout=3):
                ok, err = True, ""
        except OSError as e:
            ok, err = False, str(e)
        results.append(
            {
                "target": f"{host}:{port}",
                "ok": ok,
                "ms": int((time.monotonic() - t0) * 1000),
                "error": err,
            }
        )
    return results


# ---------------------------------------------------------------- routes
@app.get("/health")
def health() -> dict:
    hb = analyse_heartbeat()
    return {
        "status": "ok",
        "now": fmt_ts(time.time()),
        "process_uptime_s": int(time.time() - PROCESS_STARTED),
        "vm_uptime_s": int(vm_uptime()),
        "memory_mib": meminfo(),
        "heartbeat": {**hb, "gaps": hb["gaps"][-20:]},
    }


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    now = time.time()
    hb = analyse_heartbeat()
    mem = meminfo()
    net = check_network()

    net_rows = "".join(
        f"<tr><td>{html.escape(r['target'])}</td>"
        f"<td class='{'ok' if r['ok'] else 'bad'}'>{'OK' if r['ok'] else 'FAIL'}</td>"
        f"<td>{r['ms']} ms</td><td>{html.escape(r['error'])}</td></tr>"
        for r in net
    )
    gap_rows = "".join(
        f"<tr><td>{fmt_ts(g['from'])}</td><td>{fmt_ts(g['to'])}</td>"
        f"<td>{fmt_dur(g['seconds'])}</td><td>{g['kind']}</td></tr>"
        for g in reversed(hb["gaps"][-50:])
    ) or "<tr><td colspan='4'>No gaps yet 🎉</td></tr>"

    first = fmt_ts(hb["first"]) if hb["first"] else "—"
    last = fmt_ts(hb["last"]) if hb["last"] else "—"

    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="30">
<title>OLA service – smoke test</title>
<style>
  body {{ font-family: system-ui, sans-serif; margin: 16px; max-width: 760px;
         background: #111; color: #eee; }}
  h1 {{ font-size: 1.3rem; }} h2 {{ font-size: 1.05rem; margin-top: 24px; }}
  table {{ border-collapse: collapse; width: 100%; font-size: .9rem; }}
  td, th {{ border-bottom: 1px solid #333; padding: 6px 4px; text-align: left; }}
  .ok {{ color: #4ade80; font-weight: 600; }} .bad {{ color: #f87171; font-weight: 600; }}
  .muted {{ color: #999; font-size: .85rem; }}
</style></head><body>
<h1>✅ OLA message service is running</h1>
<p class="muted">Auto-refreshes every 30 s. Times in {html.escape(str(TZ))}.</p>

<h2>Runtime</h2>
<table>
<tr><td>Now</td><td>{fmt_ts(now)}</td></tr>
<tr><td>Process uptime</td><td>{fmt_dur(now - PROCESS_STARTED)}</td></tr>
<tr><td>VM uptime</td><td>{fmt_dur(vm_uptime())}</td></tr>
<tr><td>Memory available / total</td><td>{mem.get('MemAvailable', '?')} / {mem.get('MemTotal', '?')} MiB</td></tr>
<tr><td>Swap free / total</td><td>{mem.get('SwapFree', '?')} / {mem.get('SwapTotal', '?')} MiB</td></tr>
<tr><td>This process RSS</td><td>{mem.get('ProcessRSS', '?')} MiB</td></tr>
</table>

<h2>Network (checked on page load)</h2>
<table><tr><th>Target</th><th>Status</th><th>Time</th><th>Error</th></tr>{net_rows}</table>

<h2>Background survival test</h2>
<table>
<tr><td>Heartbeat every</td><td>{INTERVAL} s (gap = more than {GAP_THRESHOLD} s)</td></tr>
<tr><td>Recording since</td><td>{first}</td></tr>
<tr><td>Last heartbeat</td><td>{last}</td></tr>
<tr><td>Service starts</td><td>{hb['starts']}</td></tr>
<tr><td>Availability</td><td>{hb['availability']:.1f}% over {fmt_dur(hb['span'])}</td></tr>
</table>
<h2>Gaps (newest first)</h2>
<p class="muted"><b>paused</b> = VM was frozen by Android and resumed.
<b>restarted</b> = service or VM was killed and started again.</p>
<table><tr><th>From</th><th>To</th><th>Duration</th><th>Kind</th></tr>{gap_rows}</table>
</body></html>"""
