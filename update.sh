#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "================================================================="
echo "   REPAIR-IT - Automated System Update Script                   "
echo "================================================================="

# 1. Pull latest code from main branch
echo "[1/4] Pulling latest code from GitHub..."
git pull origin main

# 2. Update Python backend dependencies
echo "[2/4] Updating Python backend environment..."
if [ -d "backend/venv" ]; then
    backend/venv/bin/pip install -r backend/requirements.txt
else
    python3 -m venv backend/venv
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# 3. Update Node dependencies & rebuild frontend static build
echo "[3/4] Rebuilding frontend application..."
npm install
cd frontend
npm install
npm run build
cd ..

# 4. Restart systemd service if running
echo "[4/4] Checking and restarting active background service..."
if systemctl is-active --quiet repair-it 2>/dev/null; then
    echo "Restarting background systemd service 'repair-it'..."
    sudo systemctl restart repair-it
    echo "Service restarted successfully!"
else
    echo "Notice: Systemd service 'repair-it' is not active. If needed, run './start.sh'."
fi

echo "================================================================="
echo "  UPDATE COMPLETED SUCCESSFULLY!                                "
echo "  Repair-It is up to date on the latest version.                "
echo "================================================================="
