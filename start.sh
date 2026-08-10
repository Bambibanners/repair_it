#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Starting Repair-It Backend API on http://0.0.0.0:8000..."
if [ -d "backend/venv" ] && [ -f "backend/venv/bin/uvicorn" ]; then
    (cd backend && ../backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000) &
else
    (cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000) &
fi
BACKEND_PID=$!

echo "Starting Repair-It Web Application on http://0.0.0.0:10930..."
(cd frontend && npm run dev -- --host 0.0.0.0 --port 10930) &
FRONTEND_PID=$!

cleanup() {
    echo "Stopping Repair-It services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM

# Get IP address safely
IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-raspberry-pi-ip")

echo ""
echo "================================================================="
echo "  Repair-It is now RUNNING!                                      "
echo "  Local Access:   http://localhost:10930                         "
echo "  Network Access: http://${IP_ADDR}:10930                        "
echo "  Press CTRL+C to stop servers.                                  "
echo "================================================================="
echo ""

wait
