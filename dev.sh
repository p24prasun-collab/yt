#!/bin/bash

set -e
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_DIR="$PROJECT_ROOT/venv"

# Colors
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m"

info() { echo -e "${GREEN}➜${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }

# Ensure .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  warn ".env not found at $PROJECT_ROOT. Create one with YOUTUBE_API_KEY before running."
fi

# Create and activate Python venv
if [ ! -d "$VENV_DIR" ]; then
  info "Creating Python virtual environment..."
  python3 -m venv "$VENV_DIR"

source "$VENV_DIR/bin/activate"

# Install backend dependencies if needed
if ! python -c "import fastapi" >/dev/null 2>&1; then
  info "Installing backend Python dependencies..."
  pip install -r "$PROJECT_ROOT/requirements.txt"
fi

# Install frontend dependencies if needed
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  info "Installing frontend dependencies (npm install)..."
  (cd "$FRONTEND_DIR" && npm install)
fi

# Start backend
info "Starting backend (FastAPI on http://localhost:8000)…"
(cd "$BACKEND_DIR" && python main.py) &
BACKEND_PID=$!

cleanup() {
  echo
  warn "Shutting down..."
  if ps -p $BACKEND_PID > /dev/null 2>&1; then
    kill $BACKEND_PID >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

# Start frontend (foreground)
info "Starting frontend (Vite on http://localhost:5173)…"
sleep 2
if command -v open >/dev/null 2>&1; then
  open "http://localhost:5173/influencers?g=male"
fi
echo
info "Your app will open in the browser. If it doesn't, go to: http://localhost:5173/influencers?g=male"
echo
(cd "$FRONTEND_DIR" && npm run dev)
