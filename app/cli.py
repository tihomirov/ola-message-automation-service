"""Server-side admin commands.

    python -m app.cli set-password     # set/replace the backoffice password
"""

from __future__ import annotations

import argparse
import getpass
import secrets

from .auth import hash_password
from .config import config_path, load_config, save_config


def set_password() -> None:
    pw = getpass.getpass("New backoffice password: ")
    if len(pw) < 8:
        raise SystemExit("Use at least 8 characters.")
    if getpass.getpass("Repeat: ") != pw:
        raise SystemExit("Passwords do not match.")
    cfg = load_config()
    cfg.admin.password_hash = hash_password(pw)
    # a new secret also logs out every existing session
    cfg.admin.session_secret = secrets.token_urlsafe(32)
    save_config(cfg)
    print(f"Password saved to {config_path()}. Existing sessions were logged out.")


def main() -> None:
    ap = argparse.ArgumentParser(description="OLA service admin commands")
    ap.add_argument("command", choices=["set-password"])
    args = ap.parse_args()
    if args.command == "set-password":
        set_password()


if __name__ == "__main__":
    main()
