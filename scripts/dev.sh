#!/usr/bin/env bash
# Qtangl local dev helpers (macOS/Linux)
# Usage: ./scripts/dev.sh help

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

cmd="${1:-help}"

help() {
  cat <<'EOF'
Qtangl dev.sh — macOS/Linux helpers

  ./scripts/dev.sh install        pip + npm ci
  ./scripts/dev.sh api              uvicorn (backend)
  ./scripts/dev.sh web              next dev
  ./scripts/dev.sh compose          docker compose up --build
  ./scripts/dev.sh test             backend pytest + web lint/build
  ./scripts/dev.sh openapi-sync     export OpenAPI + SDK types
  ./scripts/dev.sh stats-sync       update README auto-stats
  ./scripts/dev.sh links-check      verify doc links

Environment: cp backend/.env.example .env && cp web/.env.example web/.env.local
EOF
}

case "$cmd" in
  help) help ;;
  install)
    (cd backend && python -m pip install -r requirements.lock -r requirements-dev.lock)
    (cd web && npm ci)
    ;;
  api)
    cd backend
    # shellcheck disable=SC1091
    [ -f .venv/bin/activate ] && source .venv/bin/activate
    uvicorn app.main:app --reload
    ;;
  web)
    cd web && npm run dev
    ;;
  compose)
    docker compose up --build
    ;;
  test)
    (cd backend && QTANGL_ENABLE_QAOA=false python -m pytest tests/ -q --tb=short)
    (cd web && npm run lint && npm run build)
    ;;
  openapi-sync)
    python backend/scripts/export_openapi.py
    python scripts/generate_sdk_types.py
    ;;
  stats-sync)
    node scripts/sync-readme-stats.mjs --write
    ;;
  links-check)
    node scripts/check-readme-links.mjs
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    help
    exit 1
    ;;
esac
