#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Ensure PATH includes standard binary locations & node if installed
export PATH="$PATH:/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin"

# If production dist build exists and NPM is not requested, run FastAPI directly on 10930 (Lightweight Single Process)
if [ -d "frontend/dist" ] && [ "$1" == "--prod" ]; then
    echo "Starting Repair-It Production Server on http://0.0.0.0:10930..."
    if [ -d "backend/venv" ] && [ -f "backend/venv/bin/uvicorn" ]; then
        exec backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 10930
    else
        exec python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 10930
    fi
fi

# Concurrent Dev mode (Backend on 8000 + Frontend Vite on 10930)
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
