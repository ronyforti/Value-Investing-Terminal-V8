#!/bin/bash
# ==============================================================================
# Value Investing Terminal V8 — Google Cloud Always Free VM Automated Setup
# Runs on Ubuntu 22.04/24.04 or Debian 12 in Google Cloud Compute Engine (e2-micro)
# ==============================================================================
set -e

echo "=== [1/7] Configuring 2GB Swap Memory ==="
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "=== [2/7] Installing System Packages ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git curl ufw

echo "=== [3/7] Installing Node.js 22 LTS ==="
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi

echo "=== [4/7] Installing PM2 Process Manager ==="
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo "=== [5/7] Deploying Value-Investing-Terminal-V8 ==="
INSTALL_DIR="/opt/terminal-v8"
if [ ! -d "$INSTALL_DIR" ]; then
    git clone https://github.com/ronyforti/Value-Investing-Terminal-V8.git "$INSTALL_DIR"
else
    cd "$INSTALL_DIR" && git pull origin main
fi

cd "$INSTALL_DIR"
npm install
npm run build

echo "=== [6/7] Configuring Firewall for Port 80 & 3001 ==="
ufw allow 80/tcp || true
ufw allow 3001/tcp || true
ufw allow 22/tcp || true

echo "=== [7/7] Launching Terminal V8 under PM2 on Port 80 ==="
pm2 delete terminal 2>/dev/null || true
PORT=80 pm2 start dist/server.cjs --name "terminal" --time

pm2 save
pm2 startup systemd -u root --hp /root || true

EXTERNAL_IP=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip || curl -s ifconfig.me || echo "your-server-ip")

echo "======================================================================="
echo " Value Investing Terminal V8 is ONLINE and running 24/7!"
echo " Access URL: http://${EXTERNAL_IP}"
echo "======================================================================="
