# OLA message service

Watches a Gmail inbox for order emails from the shop, fetches extra order details (e.g. item size) from the shop admin, and sends a notification by Telegram and/or email.

**Current stage: 0, smoke test.** This stage checks whether the Android Linux Terminal VM can run the service. It is a small web page that shows:

- Runtime and memory usage.
- Network reachability (Gmail IMAP/SMTP, Telegram).
- A **background survival test**: the service writes a heartbeat every 30 s. Gaps show when Android paused or killed the VM.

## Install (Debian / Android Linux Terminal)

```bash
sudo apt update && sudo apt install -y git python3-venv curl
git clone <REPO_URL> ola-message-service
cd ola-message-service
bash scripts/install.sh          # default port 8080
```

Open `http://localhost:8080` in the phone's browser. If the Terminal app asks to allow port forwarding for 8080, allow it.

## Check the shop session (order details fetch)

The shop admin has no API. The service replays the admin's own request
`POST /eco/ukr/shop/orders/getorderjson` with your browser session cookie.

1. In Chrome, open the shop admin → any order → DevTools (F12) → Network.
2. Click the `getorderjson` request → Headers → Request Headers → copy the whole `cookie:` value.
3. On the server: `nano cookie.txt`, paste the value, save (this file is git-ignored).
4. Run:

```bash
.venv/bin/python -m app.shop_client 558938      # internal order ID from /orders/edit/<ID>
```

Result `"status": "ok"` with sizes means the cookie works. `"session_expired"` means you need a fresh cookie.

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
