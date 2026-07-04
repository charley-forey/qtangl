from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    workos_org_id: Mapped[str | None] = mapped_column(String(128), nullable=True, unique=True, index=True)
    auth_mode: Mapped[str] = mapped_column(String(32), default="magic_link")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    api_keys: Mapped[list["ApiKey"]] = relationship(back_populates="tenant")
    memberships: Mapped[list["TenantMembership"]] = relationship(back_populates="tenant")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), index=True)
    key_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    label: Mapped[str] = mapped_column(String(255), default="default")
    role: Mapped[str] = mapped_column(String(16), default="admin")
    key_prefix: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_by_user_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    tenant: Mapped[Tenant] = relationship(back_populates="api_keys")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workos_user_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    memberships: Mapped[list["TenantMembership"]] = relationship(back_populates="user")


class TenantMembership(Base):
    __tablename__ = "tenant_memberships"
    __table_args__ = (UniqueConstraint("tenant_id", "user_id", name="uq_tenant_user"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String(16), default="operator")
    workos_membership_id: Mapped[str | None] = mapped_column(String(128), nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    tenant: Mapped[Tenant] = relationship(back_populates="memberships")
    user: Mapped[User] = relationship(back_populates="memberships")


class TenantInvite(Base):
    __tablename__ = "tenant_invites"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), index=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    role: Mapped[str] = mapped_column(String(16), default="operator")
    workos_invite_id: Mapped[str | None] = mapped_column(String(128), nullable=True, unique=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class DashboardSessionKey(Base):
    __tablename__ = "dashboard_session_keys"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    key_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class UploadSession(Base):
    __tablename__ = "upload_sessions"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True, default="sandbox")
    namespace: Mapped[str] = mapped_column(String(32), index=True)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class ScanJob(Base):
    __tablename__ = "scan_jobs"
    __table_args__ = (Index("ix_scan_jobs_tenant_created", "tenant_id", "created_at"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True, default="sandbox")
    status: Mapped[str] = mapped_column(String(16), index=True)
    timeline_json: Mapped[str] = mapped_column(Text, default="[]")
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    bundle_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    bundle_storage_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    payload_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    readiness_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    scenario_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    auth_method: Mapped[str | None] = mapped_column(String(32), nullable=True)
    api_key_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    actor_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    schedule_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class ScheduledScan(Base):
    __tablename__ = "scheduled_scans"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    scenario_id: Mapped[str] = mapped_column(String(64), nullable=False)
    target: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cadence_hours: Mapped[int] = mapped_column(default=168)
    next_run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    last_run_scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    last_drift_snapshot_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    notify_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    import_payload_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    job_type: Mapped[str] = mapped_column(String(32), default="scan")
    integration_provider: Mapped[str | None] = mapped_column(String(32), nullable=True)
    active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class OnboardingLead(Base):
    __tablename__ = "onboarding_leads"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    source: Mapped[str] = mapped_column(String(128), default="mini-assessment")
    scenario: Mapped[str] = mapped_column(String(64), default="")
    steps_sent: Mapped[int] = mapped_column(default=0)
    next_step_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    unsubscribed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class OnboardingKeyToken(Base):
    __tablename__ = "onboarding_key_tokens"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    payload_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    redeemed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class RemediationStatus(Base):
    __tablename__ = "remediation_status"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    scan_id: Mapped[str] = mapped_column(String(80), ForeignKey("scan_jobs.id", ondelete="CASCADE"), index=True)
    remediation_id: Mapped[str] = mapped_column(String(80), index=True)
    asset_id: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default="open")
    owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verify_scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class ShareLink(Base):
    __tablename__ = "share_links"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    scan_id: Mapped[str] = mapped_column(String(80), ForeignKey("scan_jobs.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    label: Mapped[str] = mapped_column(String(255), default="")
    scope: Mapped[str] = mapped_column(String(32), default="report")
    view_count: Mapped[int] = mapped_column(default=0)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class ShareLinkView(Base):
    __tablename__ = "share_link_views"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    link_id: Mapped[str] = mapped_column(String(80), ForeignKey("share_links.id", ondelete="CASCADE"), index=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    viewer_ip_hash: Mapped[str] = mapped_column(String(64), default="")
    user_agent: Mapped[str] = mapped_column(String(512), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class EvidenceVaultObject(Base):
    __tablename__ = "evidence_vault_objects"
    __table_args__ = (Index("ix_evidence_vault_tenant_scan", "tenant_id", "scan_id"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    scan_id: Mapped[str] = mapped_column(String(80), nullable=False)
    object_type: Mapped[str] = mapped_column(String(32), default="bundle")
    storage_key: Mapped[str] = mapped_column(String(512), default="")
    content_hash: Mapped[str] = mapped_column(String(64), default="")
    retained_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class AuditLogEntry(Base):
    __tablename__ = "audit_log"
    __table_args__ = (Index("ix_audit_log_tenant_created", "tenant_id", "created_at"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    actor: Mapped[str] = mapped_column(String(255), default="system")
    action: Mapped[str] = mapped_column(String(64), index=True)
    resource_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    detail_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    events: Mapped[str] = mapped_column(String(255), default="scan.complete")
    active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class PortfolioTarget(Base):
    __tablename__ = "portfolio_targets"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    target: Mapped[str] = mapped_column(String(255), nullable=False)
    business_unit: Mapped[str] = mapped_column(String(128), default="default")
    label: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class TenantIntegration(Base):
    __tablename__ = "tenant_integrations"
    __table_args__ = (UniqueConstraint("tenant_id", "provider", name="uq_tenant_integrations_tenant_provider"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    provider: Mapped[str] = mapped_column(String(32), index=True)
    config_json: Mapped[str] = mapped_column(Text, default="{}")
    status: Mapped[str] = mapped_column(String(32), default="active")
    last_test_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_pull_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_pull_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class TenantSettings(Base):
    __tablename__ = "tenant_settings"

    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), primary_key=True)
    settings_json: Mapped[str] = mapped_column(Text, default="{}")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class WebhookDeadLetter(Base):
    __tablename__ = "webhook_dead_letters"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), default="unknown")
    event: Mapped[str | None] = mapped_column(String(64), nullable=True)
    scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    replayed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class ScheduleRunLog(Base):
    __tablename__ = "schedule_run_logs"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    schedule_id: Mapped[str] = mapped_column(String(80), index=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="enqueued")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class RemediationProgramItem(Base):
    __tablename__ = "remediation_program_items"
    __table_args__ = (
        Index("ix_remediation_program_tenant_status", "tenant_id", "status"),
        Index("ix_remediation_program_tenant_source", "tenant_id", "source_type", "source_ref", unique=True),
    )

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False)
    source_ref: Mapped[str] = mapped_column(String(128), nullable=False)
    scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    remediation_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    asset_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    title: Mapped[str] = mapped_column(String(512), default="")
    status: Mapped[str] = mapped_column(String(32), default="open")
    owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verify_job_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    external_sync_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    deep_link: Mapped[str | None] = mapped_column(String(512), nullable=True)
    flip_job_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class CryptoFlipJob(Base):
    __tablename__ = "crypto_flip_jobs"
    __table_args__ = (
        Index("ix_crypto_flip_jobs_tenant_status", "tenant_id", "status"),
        Index("ix_crypto_flip_jobs_program_item", "program_item_id"),
    )

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    program_item_id: Mapped[str | None] = mapped_column(String(80), ForeignKey("remediation_program_items.id"), nullable=True)
    flip_surface: Mapped[str] = mapped_column(String(16), nullable=False)
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    action: Mapped[str] = mapped_column(String(64), default="flip")
    target_env: Mapped[str] = mapped_column(String(16), default="staging")
    status: Mapped[str] = mapped_column(String(32), default="draft")
    dry_run_result_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    request_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    external_ref: Mapped[str | None] = mapped_column(String(256), nullable=True)
    submitted_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approval_actor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approval_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    before_snapshot_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    after_snapshot_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    proof_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class FlipApproval(Base):
    __tablename__ = "flip_approvals"
    __table_args__ = (Index("ix_flip_approvals_job", "flip_job_id"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    flip_job_id: Mapped[str] = mapped_column(String(80), ForeignKey("crypto_flip_jobs.id"), index=True)
    actor: Mapped[str] = mapped_column(String(255), nullable=False)
    action: Mapped[str] = mapped_column(String(32), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class VerificationProof(Base):
    __tablename__ = "verification_proofs"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    program_item_id: Mapped[str] = mapped_column(String(80), ForeignKey("remediation_program_items.id"), index=True)
    verify_job_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    verify_scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    evidence_hash: Mapped[str] = mapped_column(String(64), default="")
    verify_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    flip_job_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class RemediationExternalSync(Base):
    __tablename__ = "remediation_external_sync"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    remediation_id: Mapped[str] = mapped_column(String(80), index=True)
    provider: Mapped[str] = mapped_column(String(32), index=True)
    external_ref: Mapped[str] = mapped_column(String(128), nullable=False)
    external_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    program_item_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sync_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class TenantSubscription(Base):
    __tablename__ = "tenant_subscriptions"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), index=True, unique=True)
    tier: Mapped[str] = mapped_column(String(32), default="monitor")
    stripe_customer_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="active")
    max_schedules: Mapped[int] = mapped_column(default=10)
    max_scans_per_month: Mapped[int] = mapped_column(default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class PartnerChildTenant(Base):
    __tablename__ = "partner_child_tenants"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    parent_tenant_id: Mapped[str] = mapped_column(String(64), index=True)
    child_tenant_id: Mapped[str] = mapped_column(String(64), index=True, unique=True)
    label: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class SigningKeyRecord(Base):
    __tablename__ = "signing_keys"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    alg: Mapped[str] = mapped_column(String(32), nullable=False)
    public_key_b64: Mapped[str] = mapped_column(Text, nullable=False)
    key_fingerprint: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(16), default="active")
    activated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    retired_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    kms_provider: Mapped[str | None] = mapped_column(String(32), nullable=True)
    kms_key_id: Mapped[str | None] = mapped_column(String(512), nullable=True)


class EvidenceLogEntry(Base):
    __tablename__ = "evidence_log"
    __table_args__ = (
        Index("ix_evidence_log_seq", "seq"),
        UniqueConstraint("content_hash", name="uq_evidence_log_content_hash"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    seq: Mapped[int] = mapped_column(nullable=False, unique=True)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    key_fingerprint: Mapped[str] = mapped_column(String(64), default="")
    alg: Mapped[str] = mapped_column(String(32), default="")
    signed_at: Mapped[str] = mapped_column(String(64), default="")
    prev_entry_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    entry_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class EvidenceAnchorRecord(Base):
    __tablename__ = "evidence_anchors"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    root_hash: Mapped[str] = mapped_column(String(64), index=True)
    seq: Mapped[int] = mapped_column(default=0)
    entry_count: Mapped[int] = mapped_column(default=0)
    witness_id: Mapped[str] = mapped_column(String(32), index=True)
    method: Mapped[str] = mapped_column(String(32), default="file_witness")
    anchored_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    git_commit_sha: Mapped[str | None] = mapped_column(String(64), nullable=True)
    git_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    tsa_token_b64: Mapped[str | None] = mapped_column(Text, nullable=True)
    tsa_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    merkle_root: Mapped[str | None] = mapped_column(String(64), nullable=True)


class BenchmarkAggregate(Base):
    __tablename__ = "benchmark_aggregates"
    __table_args__ = (Index("ix_benchmark_aggregates_cohort", "industry", "cohort_key"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    industry: Mapped[str] = mapped_column(String(64), nullable=False)
    cohort_key: Mapped[str] = mapped_column(String(128), nullable=False)
    sample_size: Mapped[int] = mapped_column(default=0)
    median_readiness: Mapped[float] = mapped_column(nullable=False)
    p25: Mapped[float] = mapped_column(nullable=False)
    p75: Mapped[float] = mapped_column(nullable=False)
    as_of: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class WitnessCosignature(Base):
    __tablename__ = "witness_cosignatures"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    witness_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    root_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    seq: Mapped[int] = mapped_column(nullable=False)
    alg: Mapped[str] = mapped_column(String(32), nullable=False)
    signature_b64: Mapped[str] = mapped_column(Text, nullable=False)
    public_key_b64: Mapped[str] = mapped_column(Text, nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class DriftAggregate(Base):
    __tablename__ = "drift_aggregates"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    industry: Mapped[str] = mapped_column(String(64), nullable=False)
    cohort_key: Mapped[str] = mapped_column(String(128), nullable=False)
    pattern_type: Mapped[str] = mapped_column(String(64), nullable=False)
    sample_size: Mapped[int] = mapped_column(default=0)
    metric_json: Mapped[str] = mapped_column(Text, default="{}")
    as_of: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class TenantOidcConfig(Base):
    __tablename__ = "tenant_oidc_config"

    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), primary_key=True)
    issuer_url: Mapped[str] = mapped_column(String(512), nullable=False)
    client_id: Mapped[str] = mapped_column(String(255), nullable=False)
    client_secret_enc: Mapped[str] = mapped_column(Text, default="")
    enabled: Mapped[bool] = mapped_column(default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class CbomSource(Base):
    __tablename__ = "cbom_sources"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    source_type: Mapped[str] = mapped_column(String(32), default="third-party")
    label: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(32), default="active")
    last_ingested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class CbomIngestJob(Base):
    __tablename__ = "cbom_ingest_jobs"
    __table_args__ = (
        UniqueConstraint("tenant_id", "source_id", "content_hash", name="uq_cbom_ingest_idempotent"),
    )

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    source_id: Mapped[str] = mapped_column(String(80), index=True)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    format: Mapped[str] = mapped_column(String(16), default="cdx16")
    component_count: Mapped[int] = mapped_column(default=0)
    status: Mapped[str] = mapped_column(String(32), default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class CbomComponent(Base):
    __tablename__ = "cbom_components"
    __table_args__ = (
        Index("ix_cbom_components_tenant_key", "tenant_id", "component_key"),
    )

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    component_key: Mapped[str] = mapped_column(String(64), index=True)
    bom_ref: Mapped[str] = mapped_column(String(255), default="")
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    component_type: Mapped[str] = mapped_column(String(64), default="cryptographic-asset")
    algorithm: Mapped[str] = mapped_column(String(128), default="")
    key_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    location: Mapped[str] = mapped_column(String(512), default="")
    host: Mapped[str] = mapped_column(String(255), default="")
    kind: Mapped[str] = mapped_column(String(32), default="imported")
    vulnerability_status: Mapped[str] = mapped_column(String(32), default="unknown")
    severity: Mapped[str] = mapped_column(String(16), default="info")
    pqc_replacement: Mapped[str] = mapped_column(String(255), default="")
    verification_status: Mapped[str] = mapped_column(String(32), default="unverified-source")
    provenance_json: Mapped[str] = mapped_column(Text, default="{}")
    source_id: Mapped[str] = mapped_column(String(80), index=True)
    ingest_job_id: Mapped[str] = mapped_column(String(80), index=True)
    component_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class DiscoveryFleet(Base):
    __tablename__ = "discovery_fleets"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    enrollment_token_hash: Mapped[str] = mapped_column(String(128), index=True)
    enrollment_nonce: Mapped[str] = mapped_column(String(64), default="")
    token_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    token_max_uses: Mapped[int] = mapped_column(default=100)
    token_uses: Mapped[int] = mapped_column(default=0)
    policy_json: Mapped[str] = mapped_column(Text, default="{}")
    active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class AgentCertificate(Base):
    __tablename__ = "agent_certificates"
    __table_args__ = (Index("ix_agent_certs_tenant_agent", "tenant_id", "agent_id"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    agent_id: Mapped[str] = mapped_column(String(80), ForeignKey("host_agents.id"), index=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    serial: Mapped[str] = mapped_column(String(64), index=True)
    fingerprint: Mapped[str] = mapped_column(String(128), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class HostAgent(Base):
    __tablename__ = "host_agents"
    __table_args__ = (Index("ix_host_agents_tenant_fleet", "tenant_id", "fleet_id"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    fleet_id: Mapped[str] = mapped_column(String(80), ForeignKey("discovery_fleets.id"), index=True)
    hostname: Mapped[str] = mapped_column(String(255), nullable=False)
    os: Mapped[str] = mapped_column(String(16), default="linux")
    sensor_version: Mapped[str] = mapped_column(String(32), default="0.1.0")
    status: Mapped[str] = mapped_column(String(16), default="online")
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    last_scan_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    findings_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class HostFinding(Base):
    __tablename__ = "host_findings"
    __table_args__ = (
        UniqueConstraint("tenant_id", "finding_id", name="uq_host_findings_tenant_finding"),
        Index("ix_host_findings_agent", "agent_id"),
    )

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    agent_id: Mapped[str] = mapped_column(String(80), ForeignKey("host_agents.id"), index=True)
    finding_id: Mapped[str] = mapped_column(String(128), nullable=False)
    finding_type: Mapped[str] = mapped_column(String(32), default="certificate")
    component_key: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    raw_json: Mapped[str] = mapped_column(Text, nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class CodeScanTarget(Base):
    __tablename__ = "code_scan_targets"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    provider: Mapped[str] = mapped_column(String(32), default="github")
    owner: Mapped[str] = mapped_column(String(255), nullable=False)
    repo: Mapped[str] = mapped_column(String(255), nullable=False)
    default_ref: Mapped[str] = mapped_column(String(128), default="HEAD")
    integration_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    active: Mapped[bool] = mapped_column(default=True)
    last_scan_job_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class ImageScanTarget(Base):
    __tablename__ = "image_scan_targets"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    registry: Mapped[str] = mapped_column(String(32), default="ecr")
    image_ref: Mapped[str] = mapped_column(String(512), nullable=False)
    integration_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    active: Mapped[bool] = mapped_column(default=True)
    last_scan_job_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class DriftSnapshot(Base):
    __tablename__ = "drift_snapshots"
    __table_args__ = (
        Index("ix_drift_snapshots_tenant_source_scope", "tenant_id", "source_type", "scope_key", "captured_at"),
        Index("ix_drift_snapshots_tenant_captured", "tenant_id", "captured_at"),
    )

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False)
    scope_key: Mapped[str] = mapped_column(String(512), nullable=False)
    snapshot_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    job_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class DiscoveryJob(Base):
    __tablename__ = "discovery_jobs"
    __table_args__ = (Index("ix_discovery_jobs_tenant_status", "tenant_id", "status"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    job_type: Mapped[str] = mapped_column(String(32), index=True)
    status: Mapped[str] = mapped_column(String(16), default="running")
    target_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    payload_json: Mapped[str] = mapped_column(Text, default="{}")
    result_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    timeline_json: Mapped[str] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class TenantAlert(Base):
    __tablename__ = "tenant_alerts"
    __table_args__ = (Index("ix_tenant_alerts_tenant_fired", "tenant_id", "fired_at"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    rule: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), default="info")
    message: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(32), default="scan")
    payload_json: Mapped[str] = mapped_column(Text, default="{}")
    fired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(String(80), nullable=True)
    resolution: Mapped[str | None] = mapped_column(String(32), nullable=True)


class MergeConflict(Base):
    __tablename__ = "cbom_merge_conflicts"
    __table_args__ = (Index("ix_cbom_conflicts_tenant_status", "tenant_id", "status"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    component_key: Mapped[str] = mapped_column(String(64), index=True)
    field: Mapped[str] = mapped_column(String(64), nullable=False)
    value_a: Mapped[str] = mapped_column(Text, default="")
    value_b: Mapped[str] = mapped_column(Text, default="")
    source_a: Mapped[str] = mapped_column(String(80), default="")
    source_b: Mapped[str] = mapped_column(String(80), default="")
    resolved_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="open")
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class FindingCommentRow(Base):
    __tablename__ = "finding_comments"
    __table_args__ = (Index("ix_finding_comments_tenant_finding", "tenant_id", "finding_id"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    finding_id: Mapped[str] = mapped_column(String(80), index=True)
    scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    mentions_json: Mapped[str] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class SavedViewRow(Base):
    __tablename__ = "saved_views"
    __table_args__ = (Index("ix_saved_views_tenant_user", "tenant_id", "user_id"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    user_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    persona: Mapped[str | None] = mapped_column(String(32), nullable=True)
    filters_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class WarRoomRow(Base):
    __tablename__ = "war_rooms"
    __table_args__ = (Index("ix_war_rooms_tenant_status", "tenant_id", "status"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="active")
    alert_ids_json: Mapped[str] = mapped_column(Text, default="[]")
    assignees_json: Mapped[str] = mapped_column(Text, default="[]")
    share_token: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class DemoResourceRow(Base):
    __tablename__ = "demo_resources"
    __table_args__ = (Index("ix_demo_resources_tenant", "tenant_id"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), index=True)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    host: Mapped[str] = mapped_column(String(255), nullable=False)
    port: Mapped[int | None] = mapped_column(nullable=True)
    business_unit: Mapped[str] = mapped_column(String(64), default="default")
    posture: Mapped[str] = mapped_column(String(16), default="classical")
    compliance_target: Mapped[str] = mapped_column(String(32), default="general")
    enabled: Mapped[bool] = mapped_column(default=True)
    active_events_json: Mapped[str] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class DemoSnapshotRow(Base):
    __tablename__ = "demo_snapshots"
    __table_args__ = (Index("ix_demo_snapshots_tenant_captured", "tenant_id", "captured_at"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), index=True)
    scan_id: Mapped[str] = mapped_column(String(80), index=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    readiness_score: Mapped[float] = mapped_column(default=0.0)
    readiness_band: Mapped[str] = mapped_column(String(64), default="")
    severity_counts_json: Mapped[str] = mapped_column(Text, default="{}")
    hndl_exposed: Mapped[int] = mapped_column(default=0)
    per_resource_json: Mapped[str] = mapped_column(Text, default="[]")
    alerts_json: Mapped[str] = mapped_column(Text, default="[]")
    signature_json: Mapped[str] = mapped_column(Text, default="{}")
    bundle_json: Mapped[str] = mapped_column(Text, default="{}")
    narration: Mapped[str] = mapped_column(Text, default="")
    scene_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    campaign_id: Mapped[str | None] = mapped_column(String(80), nullable=True)


class DemoCampaignRow(Base):
    __tablename__ = "demo_campaigns"
    __table_args__ = (Index("ix_demo_campaigns_tenant", "tenant_id"),)

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    steps_json: Mapped[str] = mapped_column(Text, default="[]")
    playback_state_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
