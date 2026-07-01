.PHONY: help dev dev-api dev-web compose-up compose-down test test-backend test-web openapi-sync stats-sync links-check install

help:
	@echo "Qtangl monorepo — common commands"
	@echo ""
	@echo "  make install       Install backend + web dependencies"
	@echo "  make dev-api       Run FastAPI backend (reload)"
	@echo "  make dev-web       Run Next.js frontend"
	@echo "  make compose-up    Docker Compose: Postgres + Redis + API + worker"
	@echo "  make compose-down  Stop Docker Compose stack"
	@echo "  make test          Backend pytest + web lint/build"
	@echo "  make test-backend  Backend pytest only"
	@echo "  make test-web      Web lint + build"
	@echo "  make openapi-sync  Export OpenAPI + regenerate SDK types"
	@echo "  make stats-sync    Update README auto-stats block"
	@echo "  make links-check   Verify README/doc relative links"

install:
	cd backend && python -m pip install -r requirements.lock -r requirements-dev.lock
	cd web && npm ci

dev-api:
	cd backend && uvicorn app.main:app --reload

dev-web:
	cd web && npm run dev

compose-up:
	docker compose up --build

compose-down:
	docker compose down

test-backend:
	cd backend && QTANGL_ENABLE_QAOA=false python -m pytest tests/ -q --tb=short

test-web:
	cd web && npm run lint && npm run build

test: test-backend test-web

openapi-sync:
	python backend/scripts/export_openapi.py
	python scripts/generate_sdk_types.py

stats-sync:
	node scripts/sync-readme-stats.mjs --write

links-check:
	node scripts/check-readme-links.mjs
