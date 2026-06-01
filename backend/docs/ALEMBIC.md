# Alembic migrations

Fresh deploys use `init_db()` (`create_all`) plus [`app/db/patches.py`](../app/db/patches.py).

## Bootstrap

```bash
cd backend
export DATABASE_URL=postgresql://...
alembic upgrade head
```

## New migration

```bash
alembic revision --autogenerate -m "add column foo"
alembic upgrade head
```

CI runs `alembic upgrade head` against ephemeral Postgres when configured.
