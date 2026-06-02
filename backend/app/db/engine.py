from __future__ import annotations

import hashlib
import logging
import os
from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import QueuePool

from app.db.base import Base
from app.db.config import database_url, production_mode, require_secrets_key, use_create_all_on_startup
from app.db.models import ApiKey, Tenant
from app.db.patches import apply_schema_patches

logger = logging.getLogger(__name__)

_engine: Engine | None = None
_SessionLocal: sessionmaker[Session] | None = None


def _pool_kwargs(url: str) -> dict:
    if url.startswith("sqlite"):
        return {}
    return {
        "poolclass": QueuePool,
        "pool_size": int(os.getenv("QTANGL_DB_POOL_SIZE", "5")),
        "max_overflow": int(os.getenv("QTANGL_DB_MAX_OVERFLOW", "10")),
        "pool_recycle": int(os.getenv("QTANGL_DB_POOL_RECYCLE", "1800")),
    }


def get_engine() -> Engine | None:
    global _engine, _SessionLocal
    url = database_url()
    if not url:
        return None
    if _engine is None:
        connect_args = {}
        if url.startswith("sqlite"):
            connect_args["check_same_thread"] = False
        _engine = create_engine(
            url,
            pool_pre_ping=True,
            connect_args=connect_args,
            **_pool_kwargs(url),
        )
        _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)
    return _engine


@contextmanager
def db_session() -> Iterator[Session]:
    engine = get_engine()
    if engine is None or _SessionLocal is None:
        raise RuntimeError("Database is not configured")
    session = _SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def validate_production_config() -> None:
    if require_secrets_key() and not os.getenv("QTANGL_SECRETS_KEY"):
        raise RuntimeError(
            "QTANGL_SECRETS_KEY is required in production. Generate with: "
            'python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'
        )
    if production_mode() and use_create_all_on_startup():
        logger.warning("QTANGL_DB_AUTO_MIGRATE should be false in production; use alembic upgrade head")


def _run_alembic_upgrade() -> None:
    """Apply Alembic migrations (production deploys with QTANGL_DB_AUTO_MIGRATE=false)."""
    url = database_url()
    if not url:
        return
    raw = os.getenv("QTANGL_RUN_MIGRATIONS_ON_START", "true").lower()
    if raw not in {"1", "true", "yes", "on"}:
        return
    try:
        from alembic import command
        from alembic.config import Config

        backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        cfg = Config(os.path.join(backend_root, "alembic.ini"))
        cfg.set_main_option("sqlalchemy.url", url)
        command.upgrade(cfg, "head")
        logger.info("Alembic upgrade head completed")
    except Exception as exc:
        logger.warning("Alembic upgrade skipped or failed: %s", exc)


def init_db() -> None:
    validate_production_config()
    engine = get_engine()
    if engine is None:
        return
    if use_create_all_on_startup():
        apply_schema_patches(engine)
        Base.metadata.create_all(engine)
    else:
        apply_schema_patches(engine)
        _run_alembic_upgrade()
    _seed_default_tenant(engine)


def _seed_default_tenant(engine: Engine) -> None:
    demo_key = os.getenv("QTANGL_API_KEY", "qtangl-demo-key")
    key_hash = hashlib.sha256(demo_key.encode("utf-8")).hexdigest()
    with Session(engine) as session:
        tenant = session.get(Tenant, "sandbox")
        if tenant is None:
            session.add(Tenant(id="sandbox", name="Sandbox demo"))
        existing = session.query(ApiKey).filter(ApiKey.key_hash == key_hash).one_or_none()
        if existing is None:
            session.add(
                ApiKey(
                    id="sandbox-demo-key",
                    tenant_id="sandbox",
                    key_hash=key_hash,
                    label="sandbox demo key",
                    role="admin",
                )
            )
        session.commit()


def ping_db() -> bool:
    engine = get_engine()
    if engine is None:
        return False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
