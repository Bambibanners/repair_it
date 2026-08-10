#!/usr/bin/env bash
set -e

echo "================================================================="
echo "   REPAIR-IT - Ubuntu / Raspberry Pi Automated Setup Script     "
echo "================================================================="

# 1. Update package lists & install prerequisites
echo "[1/4] Checking and installing system packages (Python3, Node.js, Pip, Venv)..."
if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y python3 python3-pip python3-venv nodejs npm git curl ufw
fi

# 2. Setup Python virtual environment & backend dependencies
echo "[2/4] Setting up Python backend virtual environment..."
python3 -m venv backend/venv
backend/venv/bin/pip install --upgrade pip
backend/venv/bin/pip install -r backend/requirements.txt

# 3. Install frontend & root Node dependencies
echo "[3/4] Installing Node modules & building frontend application..."
npm install
cd frontend
npm install
npm run build
cd ..

# 4. Generate systemd service & configure UFW firewall
echo "[4/4] Generating systemd unit & configuring firewall rules..."
chmod +x start.sh || true

CURRENT_USER=$(whoami)
CURRENT_DIR=$(pwd)
CURRENT_PATH="$PATH"

cat <<EOF > repair-it.service
[Unit]
Description=Repair-It Vintage Electronics Lifecycle Platform
After=network.target network-online.target

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=${CURRENT_DIR}
ExecStart=${CURRENT_DIR}/start.sh
Restart=always
RestartSec=5
Environment=PATH=${CURRENT_PATH}

[Install]
WantedBy=multi-user.target
EOF

if command -v ufw >/dev/null 2>&1; then
    if sudo ufw status | grep -q "Status: active"; then
        echo "UFW is active. Allowing port 10930 (Web App) and 8000 (Backend API)..."
        sudo ufw allow 10930/tcp comment 'Repair-It Web Application' || true
        sudo ufw allow 8000/tcp comment 'Repair-It Backend API' || true
    fi
fi

echo "================================================================="
echo "  SETUP COMPLETED SUCCESSFULLY!                                 "
echo "                                                                 "
echo "  To start Repair-It manually, run:                             "
echo "    ./start.sh                                                   "
echo "                                                                 "
echo "  To install as a 24/7 background system service, run:          "
echo "    sudo cp repair-it.service /etc/systemd/system/               "
echo "    sudo systemctl daemon-reload                                 "
echo "    sudo systemctl enable --now repair-it                        "
echo "                                                                 "
echo "  Access Web Interface at: http://<raspberry-pi-ip>:10930        "
echo "================================================================="
