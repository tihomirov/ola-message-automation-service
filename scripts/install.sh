#!/usr/bin/env bash
# Installs the service into a venv and registers it with systemd.
# Usage: ./scripts/install.sh [port]   (default port 8080)
set -euo pipefail

PORT="${1:-8080}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
USER_NAME="$(id -un)"

echo ">> Project dir: $DIR  user: $USER_NAME  port: $PORT"

echo ">> Creating virtualenv"
python3 -m venv "$DIR/.venv"
"$DIR/.venv/bin/pip" install --upgrade pip -q
"$DIR/.venv/bin/pip" install -r "$DIR/requirements.txt" -q

echo ">> Installing systemd unit"
sed -e "s|__USER__|$USER_NAME|g" -e "s|__DIR__|$DIR|g" -e "s|__PORT__|$PORT|g" \
  "$DIR/deploy/ola-service.service.template" | sudo tee /etc/systemd/system/ola-service.service >/dev/null

sudo systemctl daemon-reload
sudo systemctl enable --now ola-service
sleep 3
sudo systemctl --no-pager status ola-service | head -n 12

echo
echo ">> Local check:"
curl -s "http://127.0.0.1:$PORT/health" | head -c 300; echo
echo
echo ">> Open in a browser:"
echo "   on the phone:   http://localhost:$PORT"
for ip in $(hostname -I); do echo "   VM address:     http://$ip:$PORT"; done
