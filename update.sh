#!/bin/bash
set -e

echo "=== Updating Value Investing Terminal V8 ==="
INSTALL_DIR="/opt/terminal-v8"
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR"
else
    cd "$(dirname "$0")"
fi

echo "=== [1/4] Pulling latest main branch ==="
sudo git fetch origin main 2>/dev/null || git fetch origin main
sudo git reset --hard origin/main 2>/dev/null || git reset --hard origin/main
sudo chown -R $(whoami):$(whoami) . 2>/dev/null || true

echo "=== [2/4] Installing dependencies ==="
npm install

echo "=== [3/4] Building production bundle ==="
npm run build

echo "=== [4/4] Restarting PM2 process with updated env ==="
sudo pm2 restart all --update-env 2>/dev/null || pm2 restart all --update-env 2>/dev/null || sudo pm2 restart terminal --update-env 2>/dev/null || pm2 restart terminal --update-env 2>/dev/null || true

echo "=== Update Complete ==="
