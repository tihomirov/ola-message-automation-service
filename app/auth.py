"""Backoffice login: one admin, scrypt password hash, HMAC-signed session cookie.

Set the password on the server:  python -m app.cli set-password
The cookie is HttpOnly + SameSite=Strict (covers CSRF for the same-origin SPA).
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import time

from fastapi import HTTPException, Request

from .config import AppConfig, load_config

COOKIE = "ola_session"
_N, _R, _P = 2**14, 8, 1


def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=_N, r=_R, p=_P, dklen=32)
    return f"scrypt${_N}${_R}${_P}${_b64(salt)}${_b64(digest)}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, n, r, p, salt, digest = stored.split("$")
        if algo != "scrypt":
            return False
        calc = hashlib.scrypt(password.encode(), salt=_unb64(salt), n=int(n), r=int(r),
                              p=int(p), dklen=len(_unb64(digest)))
        return hmac.compare_digest(calc, _unb64(digest))
    except (ValueError, TypeError):
        return False


def make_token(secret: str, hours: int, now: float | None = None) -> str:
    exp = int((now or time.time()) + hours * 3600)
    payload = f"admin.{exp}"
    sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()
    return f"{payload}.{_b64(sig)}"


def check_token(token: str, secret: str, now: float | None = None) -> bool:
    try:
        user, exp, sig = token.split(".")
        payload = f"{user}.{exp}"
        good = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()
        return (hmac.compare_digest(good, _unb64(sig)) and user == "admin"
                and int(exp) > (now or time.time()))
    except (ValueError, TypeError):
        return False


def is_configured(cfg: AppConfig) -> bool:
    return bool(cfg.admin.password_hash and cfg.admin.session_secret)


def require_admin(request: Request) -> None:
    """FastAPI dependency for every /api route except login/me."""
    cfg = load_config()
    token = request.cookies.get(COOKIE, "")
    if not (is_configured(cfg) and token and check_token(token, cfg.admin.session_secret)):
        raise HTTPException(status_code=401, detail="not logged in")
