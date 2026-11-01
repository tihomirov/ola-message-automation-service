# OLA message service

Watches a Gmail inbox for the shop's "new order" emails, builds a notification (customer, items, total, delivery, chat links), and sends it by Telegram and/or email. Optionally (flow 2) it also fetches order details such as sizes from the shop admin.

### Status

| Part | State |
|---|---|
| Status page (`/`) and `/health` | ✅ works |
| Order email parser + message preview (flow 1) | ✅ works, by CLI |
| Shop login, order lookup and details (flow 2) | ✅ works, by CLI. Off by default |
| Gmail polling, sending to Telegram/email | ⏳ next step |
| Backoffice (Angular) | ⏳ planned |

## Install (Debian / Android Linux Terminal)

```bash
sudo apt update && sudo apt install -y git python3-venv curl
git clone <REPO_URL> ola-message-service
cd ola-message-service
bash scripts/install.sh          # default port 8080
```

Open `http://localhost:8080` in the phone's browser. If the Terminal app asks to allow port forwarding for 8080, allow it.

## How to use (current stage)

All commands run from the project folder on the server (`cd ola-message-service`).

### 1. Check the service is running

```bash
sudo systemctl status ola-service
curl -s localhost:8080/health
```

Or open `http://localhost:8080` on the phone. The page shows memory, network checks, heartbeat gaps and the current **Mode** (flow 1 or 2).

### 2. Preview the message for an order email

1. In Gmail, open an order email → **⋮** → **Download message**. This gives you an `.eml` file.
2. Copy it to the server into `samples/`. That folder is git-ignored, because real emails contain customer data.
3. Run:

```bash
.venv/bin/python -m app.email_parser samples/order.eml           # message preview
.venv/bin/python -m app.email_parser samples/order.eml --json    # + parsed fields
```

It accepts the email as the shop sends it (from `postman@site-x.pro`), a Gmail auto-forward, and a manual "Fwd:". Anything else is rejected with `Not an order email: <reason>`.

The order email contains **no sizes**. In flow 1, items are shown as the email lists them. For sizes, use flow 2.

### 3. (Flow 2 only) Check the shop access

See [Check the shop access](#check-the-shop-access-order-lookup--details) below.

### 4. Update to the latest version

```bash
git pull
.venv/bin/pip install -r requirements.txt -q
sudo systemctl restart ola-service
```

## Flows (toggle)

| `OLA_FETCH_ORDER_DETAILS` | Flow |
|---|---|
| `false` (default) | **Flow 1:** order email → message + links. The shop admin is never contacted. |
| `true` | **Flow 2:** order email → find the order on the shop by its number → order details (sizes) → message + links. |

To switch, edit the unit and restart:

```bash
sudo systemctl edit ola-service     # add: [Service]  Environment=OLA_FETCH_ORDER_DETAILS=true
sudo systemctl restart ola-service
curl -s localhost:8080/health | grep -o '"features":{[^}]*}'
```

The status page shows the current mode. The section below is only needed for flow 2.

## Check the shop access (order lookup + details)

The shop admin has no API. The service replays the admin's own requests:

- `POST /eco/ukr/main/signin`: log in with email and password (gets the session cookie)
- `POST /eco/ukr/shop/orders/getjson`: find an order by its number from the email (e.g. `CB01E`)
- `POST /eco/ukr/shop/orders/getorderjson`: full order (items, sizes, phone)

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
sudo journalctl -u ola-service -f       # live logs
sudo systemctl restart ola-service      # restart
git pull && sudo systemctl restart ola-service   # update
curl -s localhost:8080/health           # JSON status
```

## Uninstall

```bash
sudo systemctl disable --now ola-service
sudo rm /etc/systemd/system/ola-service.service && sudo systemctl daemon-reload
```
