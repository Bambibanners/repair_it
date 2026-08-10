#!/usr/bin/env bash
set -e

echo "================================================================="
echo "   REPAIR-IT - Ubuntu / Raspberry Pi Automated Setup Script     "
echo "================================================================="

# 1. Update package lists & install prerequisites
echo "[1/4] Checking and installing system packages (Python3, Node.js, Pip, Venv)..."
if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y python3 python3-pip python3-venv nodejs npm git curl
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

# 4. Create start executable helper script
echo "[4/4] Finalizing configuration..."
chmod +x start.sh || true

echo "================================================================="
echo "  SETUP COMPLETED SUCCESSFULLY!                                 "
echo "                                                                 "
echo "  To start Repair-It now, run:                                  "
echo "    ./start.sh                                                   "
echo "                                                                 "
echo "  Access the Web Interface at: http://<raspberry-pi-ip>:10930    "
echo "================================================================="
