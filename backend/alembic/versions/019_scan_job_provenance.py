"""Add scan job auth provenance columns."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

from app.db.migration_compat import add_column_if_absent

revision = "019_scan_job_provenance"
down_revision = "018_tenant_alerts_resolved"
branch_labels = None
depends_on = None


def upgrade() -> None:
    add_column_if_absent("scan_jobs", sa.Column("auth_method", sa.String(32), nullable=True))
    add_column_if_absent("scan_jobs", sa.Column("api_key_id", sa.String(64), nullable=True))
    add_column_if_absent("scan_jobs", sa.Column("actor_email", sa.String(320), nullable=True))
    add_column_if_absent("scan_jobs", sa.Column("schedule_id", sa.String(80), nullable=True))


def downgrade() -> None:
    op.drop_column("scan_jobs", "schedule_id")
    op.drop_column("scan_jobs", "actor_email")
    op.drop_column("scan_jobs", "api_key_id")
    op.drop_column("scan_jobs", "auth_method")
