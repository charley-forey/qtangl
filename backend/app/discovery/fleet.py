from __future__ import annotations

import hashlib
import json
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import DiscoveryFleet, HostAgent, HostFinding
from app.discovery.host_normalize import finding_dedupe_key, findings_to_assets
from app.discovery.schema import validate_finding

TOKEN_TTL_HOURS = 72


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_fleet(*, tenant_id: str, name: str, policy: dict[str, Any] | None = None) -> dict[str, Any]:
    fleet_id = f"fleet-{uuid.uuid4().hex[:12]}"
    token = secrets.token_urlsafe(32)
    expires = _utcnow() + timedelta(hours=TOKEN_TTL_HOURS)
    if not persistence_enabled():
        return {
            "fleetId": fleet_id,
            "name": name,
            "enrollmentToken": token,
            "expiresAt": expires.isoformat(),
        }
    with db_session() as session:
        row = DiscoveryFleet(
            id=fleet_id,
            tenant_id=tenant_id,
            name=name,
            enrollment_token_hash=_hash_token(token),
            token_expires_at=expires,
            policy_json=json.dumps(policy or {}),
        )
        session.add(row)
        session.flush()
    return {
        "fleetId": fleet_id,
        "name": name,
        "enrollmentToken": token,
        "expiresAt": expires.isoformat(),
    }


def list_fleets(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = session.query(DiscoveryFleet).filter(DiscoveryFleet.tenant_id == tenant_id).all()
        return [
            {
                "fleetId": r.id,
                "name": r.name,
                "active": r.active,
                "tokenUses": r.token_uses,
                "tokenMaxUses": r.token_max_uses,
                "expiresAt": r.token_expires_at.isoformat() if r.token_expires_at else None,
                "createdAt": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]


def enroll_agent(
    *,
    enrollment_token: str,
    hostname: str,
    os_name: str,
    sensor_version: str,
) -> dict[str, Any] | None:
    if not enrollment_token.strip():
        return None
    if not persistence_enabled():
        agent_id = f"agent-{uuid.uuid4().hex[:12]}"
        return {"agentId": agent_id, "tenantId": "sandbox", "fleetId": "fleet-demo", "apiKey": "demo"}
    token_hash = _hash_token(enrollment_token)
    with db_session() as session:
        fleet = (
            session.query(DiscoveryFleet)
            .filter(
                DiscoveryFleet.enrollment_token_hash == token_hash,
                DiscoveryFleet.active.is_(True),
            )
            .first()
        )
        if fleet is None:
            return None
        if fleet.token_expires_at < _utcnow():
            return None
        if fleet.token_uses >= fleet.token_max_uses:
            return None
        agent_id = f"agent-{uuid.uuid4().hex[:12]}"
        agent = HostAgent(
            id=agent_id,
            tenant_id=fleet.tenant_id,
            fleet_id=fleet.id,
            hostname=hostname,
            os=os_name,
            sensor_version=sensor_version,
            status="online",
            last_seen_at=_utcnow(),
        )
        session.add(agent)
        fleet.token_uses += 1
        session.flush()
        return {
            "agentId": agent_id,
            "tenantId": fleet.tenant_id,
            "fleetId": fleet.id,
        }


def record_heartbeat(*, agent_id: str, tenant_id: str, sensor_version: str | None = None) -> bool:
    if not persistence_enabled():
        return True
    with db_session() as session:
        agent = session.get(HostAgent, agent_id)
        if agent is None or agent.tenant_id != tenant_id:
            return False
        agent.last_seen_at = _utcnow()
        agent.status = "online"
        if sensor_version:
            agent.sensor_version = sensor_version
        session.flush()
        return True


def ingest_findings(
    *,
    agent_id: str,
    tenant_id: str,
    findings: list[dict[str, Any]],
) -> dict[str, Any]:
    accepted = 0
    rejected = 0
    duplicate = 0
    assets: list[Any] = []
    if not persistence_enabled():
        accepted = 0
        rejected = 0
        for finding in findings:
            ok, _reason = validate_finding(finding)
            if ok:
                accepted += 1
            else:
                rejected += 1
        return {"accepted": accepted, "rejected": rejected, "duplicate": 0, "assets": []}
    with db_session() as session:
        agent = session.get(HostAgent, agent_id)
        if agent is None or agent.tenant_id != tenant_id:
            return {"accepted": 0, "rejected": len(findings), "duplicate": 0, "error": "agent_not_found"}
        valid_findings: list[dict[str, Any]] = []
        for finding in findings:
            ok, reason = validate_finding(finding)
            if not ok:
                rejected += 1
                continue
            fid = finding_dedupe_key(finding)
            existing = (
                session.query(HostFinding)
                .filter(HostFinding.tenant_id == tenant_id, HostFinding.finding_id == fid)
                .first()
            )
            if existing:
                duplicate += 1
                continue
            row = HostFinding(
                id=f"hf-{uuid.uuid4().hex[:12]}",
                tenant_id=tenant_id,
                agent_id=agent_id,
                finding_id=fid,
                finding_type=str(finding.get("findingType", "certificate")),
                raw_json=json.dumps(finding),
            )
            session.add(row)
            valid_findings.append(finding)
            accepted += 1
        agent.findings_count = (agent.findings_count or 0) + accepted
        agent.last_scan_at = _utcnow()
        session.flush()
        assets = findings_to_assets(valid_findings, agent_hostname=agent.hostname)
        try:
            from app.discovery.merge_conflicts import conflicts_from_finding_updates

            conflicts_from_finding_updates(
                tenant_id=tenant_id,
                agent_id=agent_id,
                new_findings=valid_findings,
            )
        except Exception:
            pass
    return {
        "accepted": accepted,
        "rejected": rejected,
        "duplicate": duplicate,
        "assetCount": len(assets),
        "assets": [a.id for a in assets],
    }


def rotate_fleet_token(*, tenant_id: str, fleet_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    token = secrets.token_urlsafe(32)
    expires = _utcnow() + timedelta(hours=TOKEN_TTL_HOURS)
    with db_session() as session:
        fleet = session.get(DiscoveryFleet, fleet_id)
        if fleet is None or fleet.tenant_id != tenant_id:
            return None
        fleet.enrollment_token_hash = _hash_token(token)
        fleet.token_expires_at = expires
        fleet.token_uses = 0
        fleet.updated_at = _utcnow()
        session.flush()
    return {"fleetId": fleet_id, "enrollmentToken": token, "expiresAt": expires.isoformat()}


def revoke_agents(*, tenant_id: str, agent_ids: list[str]) -> int:
    if not persistence_enabled():
        return 0
    with db_session() as session:
        count = 0
        for agent_id in agent_ids:
            agent = session.get(HostAgent, agent_id)
            if agent is None or agent.tenant_id != tenant_id:
                continue
            agent.status = "revoked"
            count += 1
        session.flush()
        return count


def list_agents(*, tenant_id: str, fleet_id: str | None = None) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        q = session.query(HostAgent).filter(HostAgent.tenant_id == tenant_id)
        if fleet_id:
            q = q.filter(HostAgent.fleet_id == fleet_id)
        return [
            {
                "agentId": a.id,
                "fleetId": a.fleet_id,
                "hostname": a.hostname,
                "os": a.os,
                "sensorVersion": a.sensor_version,
                "status": a.status,
                "lastSeenAt": a.last_seen_at.isoformat() if a.last_seen_at else None,
                "lastScanAt": a.last_scan_at.isoformat() if a.last_scan_at else None,
                "findingsCount": a.findings_count,
            }
            for a in q.all()
        ]
