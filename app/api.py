"""JSON API for the Angular backoffice. Everything except /api/auth/* needs login."""

from __future__ import annotations

import time
from dataclasses import asdict, fields

from fastapi import APIRouter, Body, Cookie, Depends, HTTPException, Response
from pydantic import BaseModel

from . import runtime
from .auth import COOKIE, check_token, is_configured, make_token, require_admin, verify_password
from .config import ConfigError, LinkConfig, load_config, masked_dict, merge_update, save_config
from .message import EmailOrder, EmailOrderItem
from .settings import load_features

router = APIRouter(prefix="/api")
protected = APIRouter(dependencies=[Depends(require_admin)])

SAMPLE_ORDER = EmailOrder(
    number="CD109", customer_name="Олена Тестова", phone="+380670000000",
    items=["Сукні, SALE Сатинова сукня з відкритими плечима (2 450 ₴ x 1)"], total="2 450 ₴",
    customer_email="customer@example.com",
    delivery="Самовивіз з «Нова Пошта» (за тарифами перевізника)",
    address="Київ, Відділення №1 (до 10 кг): вул. Тестова, 1",
    payment="Накладений платіж (оплата при отриманні)",
    item_details=[EmailOrderItem("Сукні, SALE Сатинова сукня з відкритими плечима", "2 450 ₴", 1, "2 450 ₴")],
)


def _cfg():
    try:
        return load_config()
    except ConfigError as e:
        raise HTTPException(500, f"config.yaml: {e}")


# ------------------------------------------------------------------ auth
class LoginIn(BaseModel):
    password: str


_failures = {"n": 0, "until": 0.0}


@router.post("/auth/login")
def login(body: LoginIn, response: Response) -> dict:
    cfg = _cfg()
    if not is_configured(cfg):
        raise HTTPException(409, "no password set: run `python -m app.cli set-password` on the server")
    if time.time() < _failures["until"]:
        raise HTTPException(429, "too many attempts, wait a minute")
    if not verify_password(body.password, cfg.admin.password_hash):
        _failures["n"] += 1
        if _failures["n"] >= 5:
            _failures.update(n=0, until=time.time() + 60)
        time.sleep(1)
        raise HTTPException(401, "wrong password")
    _failures["n"] = 0
    response.set_cookie(COOKIE, make_token(cfg.admin.session_secret, cfg.admin.session_hours),
                        max_age=cfg.admin.session_hours * 3600, httponly=True,
                        samesite="strict", path="/")
    return {"ok": True}


@router.post("/auth/logout")
def logout(response: Response) -> dict:
    response.delete_cookie(COOKIE, path="/")
    return {"ok": True}


@router.get("/auth/me")
def me_cookie(ola_session: str | None = Cookie(default=None)) -> dict:
    cfg = _cfg()
    configured = is_configured(cfg)
    logged_in = bool(configured and ola_session and check_token(ola_session, cfg.admin.session_secret))
    return {"configured": configured, "logged_in": logged_in}


# ------------------------------------------------------------------ meta / status
@protected.get("/meta")
def meta() -> dict:
    from .main import build_commit
    cfg = _cfg()
    return {"fetch_order_details": load_features(cfg).fetch_order_details,
            "build_commit": build_commit()}


@protected.get("/system/status")
def system_status() -> dict:
    from . import main as m
    now = time.time()
    hb = m.analyse_heartbeat()
    try:
        f = load_features()
        mode = "flow2" if f.fetch_order_details else "flow1"
    except ConfigError:
        mode = "invalid-config"
    return {
        "now": m.fmt_ts(now),
        "timezone": str(m.TZ),
        "mode": mode,
        "build_commit": m.build_commit(),
        "process_uptime_s": int(now - m.PROCESS_STARTED),
        "vm_uptime_s": int(m.vm_uptime()),
        "memory_mib": m.meminfo(),
        "network": m.check_network(),
        "worker": m.worker_status(),
        "heartbeat": {
            "interval_s": m.INTERVAL,
            "first": m.fmt_ts(hb["first"]) if hb["first"] else None,
            "last": m.fmt_ts(hb["last"]) if hb["last"] else None,
            "starts": hb["starts"],
            "availability": round(hb["availability"], 1),
            "span_s": hb["span"],
            "gaps": [{"from": m.fmt_ts(g["from"]), "to": m.fmt_ts(g["to"]),
                      "seconds": g["seconds"], "kind": g["kind"]}
                     for g in reversed(hb["gaps"][-50:])],
        },
    }


# ------------------------------------------------------------------ orders
def _store():
    from .store import Store
    return Store(_cfg().db_file())


@protected.get("/orders")
def orders(limit: int = 50, offset: int = 0, status: str | None = None) -> dict:
    st = _store()
    limit = max(1, min(limit, 200))
    return {"total": st.total(status), "items": st.recent(limit, offset, status)}


@protected.get("/orders/{number}")
def order(number: str) -> dict:
    o = _store().get_order(number)
    if not o:
        raise HTTPException(404, "order not found")
    return o


# ------------------------------------------------------------------ config
@protected.get("/config")
def get_config() -> dict:
    cfg = _cfg()
    return {"config": masked_dict(cfg), "problems": cfg.problems()}


@protected.put("/config")
def put_config(update: dict = Body(...)) -> dict:
    try:
        cfg = merge_update(_cfg(), update)
    except ConfigError as e:
        raise HTTPException(422, str(e))
    save_config(cfg)
    runtime.restart_worker()
    return {"config": masked_dict(cfg), "problems": cfg.problems()}


# ------------------------------------------------------------------ actions
@protected.post("/actions/test-email")
def test_email() -> dict:
    from .mailer import SmtpMailer
    cfg = _cfg()
    problems = [p for p in cfg.problems() if p.startswith(("email", "SMTP", "no channel"))]
    if problems:
        raise HTTPException(422, "; ".join(problems))
    try:
        SmtpMailer(cfg).send("✅ OLA service: test email",
                             "If you can read this, the email channel works.")
    except Exception as e:
        raise HTTPException(502, f"{type(e).__name__}: {e}")
    return {"ok": True, "to": cfg.email.to}


@protected.post("/actions/test-mailbox")
def test_mailbox() -> dict:
    from .mailbox import ImapMailbox, MailboxError
    cfg = _cfg()
    mb = cfg.mailbox
    if not (mb.username and mb.password):
        raise HTTPException(422, "mailbox.username / mailbox.password are not set")
    try:
        with ImapMailbox(mb) as box:
            senders = list(dict.fromkeys(mb.allowed_senders + mb.allowed_forwarders))
            waiting = box.search(senders, [mb.processed_label, mb.ignored_label, mb.failed_label],
                                 mb.lookback_days)
            return {"ok": True, "gmail": box.gmail, "waiting": len(waiting)}
    except MailboxError as e:
        raise HTTPException(502, str(e))


@protected.post("/actions/dry-run")
def dry_run() -> dict:
    from .mailbox import MailboxError
    from .worker import Worker
    cfg = _cfg()
    problems = [p for p in cfg.problems() if not p.startswith(("email", "SMTP", "no channel"))]
    if problems:
        raise HTTPException(422, "; ".join(problems))
    try:
        res = Worker(cfg).poll(dry_run=True)
    except MailboxError as e:
        raise HTTPException(502, str(e))
    d = asdict(res)
    d["previews"] = [{"subject": s, "text": t} for s, t in res.previews]
    return d


class ShopTestIn(BaseModel):
    number: str


@protected.post("/actions/shop-test")
def shop_test(body: ShopTestIn) -> dict:
    cfg = _cfg()
    if not load_features(cfg).fetch_order_details:
        raise HTTPException(409, "flow 2 (fetch_order_details) is off")
    from .worker import make_fetcher
    client = make_fetcher(cfg)
    try:
        res = client.fetch_order_by_number(body.number)
        return {"status": res.status.value, "detail": res.detail,
                "summary": asdict(res.summary) if res.summary else None,
                "order": asdict(res.order) if res.order else None,
                "cookie_names": client.cookie_names()}
    finally:
        client.close()


# ------------------------------------------------------------------ template
class PreviewIn(BaseModel):
    text: str = ""
    subject: str | None = None
    links: list[dict] | None = None
    number: str | None = None  # use a stored order's data instead of the sample


@protected.get("/template/default")
def template_default() -> dict:
    from .render import DEFAULT_SUBJECT, DEFAULT_TEMPLATE, VARIABLES_HELP
    return {"text": DEFAULT_TEMPLATE, "subject": DEFAULT_SUBJECT, "variables": VARIABLES_HELP}


@protected.post("/template/preview")
def template_preview(body: PreviewIn) -> dict:
    from jinja2 import TemplateError

    from .mailer import render_subject, text_to_html
    from .render import DEFAULT_TEMPLATE, build_context, render_template

    cfg = _cfg()
    order_ = SAMPLE_ORDER
    source = "sample"
    if body.number:
        stored = _store().get_order(body.number)
        if stored and stored.get("data"):
            data = dict(stored["data"])
            names = {f.name for f in fields(EmailOrder)}
            data["item_details"] = [EmailOrderItem(**i) for i in data.get("item_details") or []]
            order_ = EmailOrder(**{k: v for k, v in data.items() if k in names})
            source = f"order {body.number}"
    links = cfg.template.links
    if body.links is not None:
        links = [LinkConfig(name=str(x.get("name", "")), url=str(x.get("url", ""))) for x in body.links]
    subject = render_subject(body.subject if body.subject is not None else cfg.email.subject,
                             vars(order_))
    try:
        text = render_template(body.text.strip() or DEFAULT_TEMPLATE,
                               build_context(order_, links=links))
        return {"text": text, "html": text_to_html(text), "subject": subject,
                "error": None, "source": source}
    except TemplateError as e:
        line = getattr(e, "lineno", None)
        return {"text": "", "subject": subject, "source": source,
                "error": f"{type(e).__name__}: {e}" + (f" (line {line})" if line else "")}


router.include_router(protected)
