# AGENTS.md

## Cursor Cloud specific instructions

### Services overview

| Service | Directory | Command | Port |
|---------|-----------|---------|------|
| Backend API | `backend/` | `source .venv/bin/activate && uvicorn app.main:app --reload` | 8000 |
| Web Frontend | `web/` | `npm run dev` | 3000 |

### Backend (FastAPI + OR-Tools + Qiskit)

- **Venv location**: `backend/.venv` (Python 3.12).
- **Tests**: `cd backend && source .venv/bin/activate && python -m unittest discover -s tests -v` (pytest is not in `requirements.txt`; use `unittest`).
- **QAOA memory**: The Qiskit Aer simulator requires >16 GB RAM for non-trivial problems. The QAOA path only runs for problems with **≤ 3 tasks** (`pipeline.py`). When testing the `/optimize` endpoint, use **4+ tasks** to get fast classical-only responses. The QAOA path will block the single-threaded uvicorn worker and make the server unresponsive until it finishes.
- **Default API key**: `qtangl-demo-key` (set via `QTANGL_API_KEY` env var, passed as `X-API-Key` header).
- No database; the backend is fully stateless.

### Web Frontend (Next.js 16 / React 19)

- **Lint**: `cd web && npm run lint`
- **Build**: `cd web && npm run build`
- **Dev server**: `cd web && npm run dev`
- The interactive demo at `/try` uses hardcoded client-side demo data (`lib/demo-data.ts`) and does not call the backend API.
- To connect the web frontend to a local backend, set `NEXT_PUBLIC_QTANGL_API_BASE_URL=http://localhost:8000` before starting the dev server.

### Notes

- `python3.12-venv` system package is required to create the backend virtualenv (not installed by default on Ubuntu 24.04 minimal images).
- No pre-commit hooks, no monorepo tooling, no docker-compose. Each service is set up independently.
