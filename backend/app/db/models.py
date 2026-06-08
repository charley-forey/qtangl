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
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    api_keys: Mapped[list["ApiKey"]] = relationship(back_populates="tenant")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), index=True)
    key_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    label: Mapped[str] = mapped_column(String(255), default="default")
    role: Mapped[str] = mapped_column(String(16), default="admin")
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    tenant: Mapped[Tenant] = relationship(back_populates="api_keys")


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


class RemediationExternalSync(Base):
    __tablename__ = "remediation_external_sync"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id"), index=True)
    remediation_id: Mapped[str] = mapped_column(String(80), index=True)
    provider: Mapped[str] = mapped_column(String(32), index=True)
    external_ref: Mapped[str] = mapped_column(String(128), nullable=False)
    external_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    scan_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
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
