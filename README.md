# OLA message service

Watches a Gmail inbox for the shop's "new order" emails, builds a notification (customer, items, total, delivery, address, payment, chat links) and sends it **by email**. Optionally (flow 2) it also fetches order details such as sizes from the shop admin.

| Part | State |
|---|---|
| Gmail polling (configurable) | ✅ |
| Email notifications | ✅ |
| Order email parser (direct, auto-forwarded, manual "Fwd:") | ✅ |
| History and dedupe (SQLite, size-capped) | ✅ |
| Status page (`/`) and `/health` | ✅ |
| Flow 2: shop login, order lookup and sizes | ✅ off by default |
| Backoffice (Angular) | ⏳ planned |

## How it works

Every `poll_interval_seconds` (default 60), the service:

1. Searches the mailbox for emails from `allowed_senders` (and `allowed_forwarders`), newer than `lookback_days`, that don't have an `ola-*` label yet.
2. For each email, oldest first:
   - **Not an order email** → label `ola-ignored`.
   - **Order already notified** (same order number) → label `ola-processed`, nothing is sent.
   - **New order** → builds the message → sends it to `email.to` → label `ola-processed`.
   - **Send failed** → tries again on the next poll. After `max_attempts` failures → label `ola-failed`.

Emails are never deleted or marked as read. If the server was off, the next poll picks up everything from the last `lookback_days`.

The order email contains **no sizes**. Flow 1 (default) shows items as the email lists them. Flow 2 adds sizes from the shop admin.

## Install (Debian / Android Linux Terminal)

```bash
sudo apt update && sudo apt install -y git python3-venv curl
git clone https://github.com/tihomirov/ola-message-automation-service.git ola-message-service
cd ola-message-service
bash scripts/install.sh          # default port 8080; creates config.yaml (disabled)
```

Open `http://localhost:8080` in the phone's browser. If the Terminal app asks to allow port forwarding for 8080, allow it. Until you configure it, the status page shows **Mail worker: not running** and the reason.

## Setup

### 1. Gmail account for the bot

1. Create a Gmail account for the bot, or use a spare one. Don't use your personal account: the app password opens the whole mailbox.
2. Turn on **2-Step Verification** in that account (Google Account → Security).
3. Create an **app password**: Google Account → Security → App passwords (or search "App passwords"). Copy the 16 characters.
4. IMAP is on by default for Gmail.

### 2. Get the order emails into that account

Pick one:

- **Best:** in the shop admin's notification settings, add the bot address as an extra recipient.
- **Or:** in the Gmail that receives the orders now, go to Settings → Forwarding → Add a forwarding address (the bot address). Gmail sends a confirmation code to the bot mailbox; confirm it. Then create a filter: `from:postman@site-x.pro` → **Forward to** the bot address.

Both keep the original sender, so nothing else is needed. If you sometimes forward an order by hand ("Fwd:"), add your address to `mailbox.allowed_forwarders`.

### 3. Fill in config.yaml

```bash
nano config.yaml        # created by install.sh; config.example.yaml has every option with comments
```

Minimum to change:

```yaml
mailbox:
  enabled: true
  username: bot-account@gmail.com
  password: "abcd efgh ijkl mnop"    # the app password
email:
  enabled: true
  to:
    - you@example.com                # where notifications go (several allowed)
```

The email channel sends from the bot account with the same app password, unless you set `email.username`/`email.password`.

### 4. Test, then start

```bash
.venv/bin/python -m app.worker --test-email          # sends a test email to email.to
.venv/bin/python -m app.worker --once --dry-run      # reads the mailbox, prints the messages it WOULD send
sudo systemctl restart ola-service                   # start polling
sudo journalctl -u ola-service -f                    # watch it work
```

The dry run doesn't send anything or add labels. The status page shows the last poll, the result counts, errors and the DB size.

To process one poll by hand (sends for real and adds labels): `.venv/bin/python -m app.worker --once`.

## Configuration reference

`config.yaml` (git-ignored, `chmod 600`; restart after changes):

| Key | Default | Meaning |
|---|---|---|
| `features.fetch_order_details` | `false` | `true` = flow 2 (needs `shop:`). The env var `OLA_FETCH_ORDER_DETAILS` overrides it. |
| `mailbox.poll_interval_seconds` | `60` | How often to check the mailbox (min 15) |
| `mailbox.lookback_days` | `2` | Ignore older emails. Also the catch-up window after downtime |
| `mailbox.allowed_senders` | `[postman@site-x.pro]` | Only emails from these count as orders |
| `mailbox.allowed_forwarders` | `[]` | Accept manual "Fwd:" from these addresses |
| `mailbox.*_label` | `ola-processed / ola-ignored / ola-failed` | Gmail labels the service adds |
| `mailbox.max_attempts` | `5` | Send attempts before `ola-failed` |
| `email.to` | — | Notification recipients |
| `email.subject` | `🛍 Нове замовлення №{number} — {customer_name}` | Also `{phone}`, `{total}`, `{delivery}`, `{payment}` |
| `email.smtp_port` | `587` | `587` = STARTTLS, `465` = SSL |
| `storage.max_size_mb` / `retention_days` | `50` / `180` | DB size cap: older rows are deleted first |

## Preview the message for a single email

1. In Gmail, open an order email → **⋮** → **Download message**. This gives you an `.eml` file.
2. Copy it to `samples/` on the server. That folder is git-ignored, because real emails contain customer data.
3. Run:

```bash
.venv/bin/python -m app.email_parser samples/order.eml           # message preview
.venv/bin/python -m app.email_parser samples/order.eml --json    # + parsed fields
```

## Update

```bash
git pull
.venv/bin/pip install -r requirements.txt -q
sudo systemctl restart ola-service
```

## Flow 2: check the shop access (order lookup + details)

The shop admin has no API. The service replays the admin's own requests:

- `POST /eco/ukr/main/signin`: log in with email and password (gets the session cookie)
- `POST /eco/ukr/shop/orders/getjson`: find an order by its number from the email (e.g. `CB01E`)
- `POST /eco/ukr/shop/orders/getorderjson`: full order (items, sizes, phone)

To turn flow 2 on, set `features.fetch_order_details: true` and fill in `shop:` in `config.yaml`. Before that, check access by hand:

**Main way: auto-login.** The service logs in by itself and logs in again when the session expires. At most one attempt per minute, so a wrong password never loops.

```bash
export OLA_SHOP_EMAIL='you@example.com'
.venv/bin/python -m app.shop_client --login-only     # asks for the password, prints cookie names
.venv/bin/python -m app.shop_client CB01E            # order number from the email
.venv/bin/python -m app.shop_client --id 1365649     # or the internal ID
```

**Fallback: pasted cookie.** Use this if the login stops working, for example if the shop adds a captcha.

1. In Chrome, open the shop admin → any order → DevTools (F12) → Network.
2. Click the `getorderjson` request → Headers → Request Headers → copy the whole `cookie:` value.
3. On the server: `nano cookie.txt`, paste the value, save (this file is git-ignored).
4. Run `.venv/bin/python -m app.shop_client CB01E` without `OLA_SHOP_EMAIL`.

`"status": "ok"` means it works. `"session_expired"` means log in again or paste a fresh cookie.

## Tests

```bash
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m pytest -q
```

## Useful commands

```bash
sudo systemctl status ola-service       # is it running?
.venv/bin/python -m app.worker --test-email   # check the email channel
sudo journalctl -u ola-service -f       # live logs
sudo systemctl restart ola-service      # restart
.venv/bin/python -m app.worker --once --dry-run   # what the next poll would send
curl -s localhost:8080/health           # JSON status
```

## Uninstall

```bash
sudo systemctl disable --now ola-service
sudo rm /etc/systemd/system/ola-service.service && sudo systemctl daemon-reload
```
