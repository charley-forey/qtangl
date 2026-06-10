"""Internal CA and agent certificate issuance for discovery mTLS."""

from __future__ import annotations

import hashlib
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session

CERT_TTL_DAYS = int(os.environ.get("DISCOVERY_AGENT_CERT_TTL_DAYS", "90"))


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _fingerprint(pem: bytes) -> str:
    return hashlib.sha256(pem).hexdigest()


def _load_ca_material() -> tuple[Any, Any, bytes]:
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import NameOID

    ca_key_pem = os.environ.get("DISCOVERY_CA_KEY_PEM", "").strip()
    ca_cert_pem = os.environ.get("DISCOVERY_CA_CERT_PEM", "").strip()
    if ca_key_pem and ca_cert_pem:
        ca_key = serialization.load_pem_private_key(ca_key_pem.encode(), password=None)
        ca_cert = x509.load_pem_x509_certificate(ca_cert_pem.encode())
        return ca_key, ca_cert, ca_cert_pem.encode()

    ca_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name(
        [
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Qtangl"),
            x509.NameAttribute(NameOID.COMMON_NAME, "Qtangl Discovery CA"),
        ]
    )
    ca_cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(ca_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(_utcnow())
        .not_valid_after(_utcnow() + timedelta(days=3650))
        .add_extension(x509.BasicConstraints(ca=True, path_length=1), critical=True)
        .sign(ca_key, hashes.SHA256())
    )
    ca_pem = ca_cert.public_bytes(serialization.Encoding.PEM)
    return ca_key, ca_cert, ca_pem


def issue_agent_certificate(*, agent_id: str, tenant_id: str) -> dict[str, str]:
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import NameOID

    ca_key, ca_cert, ca_chain_pem = _load_ca_material()
    agent_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    san = f"{agent_id}.{tenant_id}"
    subject = x509.Name(
        [
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Qtangl"),
            x509.NameAttribute(NameOID.COMMON_NAME, san),
        ]
    )
    serial = x509.random_serial_number()
    not_after = _utcnow() + timedelta(days=CERT_TTL_DAYS)
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(ca_cert.subject)
        .public_key(agent_key.public_key())
        .serial_number(serial)
        .not_valid_before(_utcnow())
        .not_valid_after(not_after)
        .add_extension(
            x509.SubjectAlternativeName([x509.DNSName(san)]),
            critical=False,
        )
        .sign(ca_key, hashes.SHA256())
    )
    cert_pem = cert.public_bytes(serialization.Encoding.PEM).decode()
    key_pem = agent_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    fp = _fingerprint(cert_pem.encode())
    serial_hex = format(serial, "x")

    if persistence_enabled():
        from app.db.models import AgentCertificate

        with db_session() as session:
            row = AgentCertificate(
                id=f"acert-{uuid.uuid4().hex[:12]}",
                agent_id=agent_id,
                tenant_id=tenant_id,
                serial=serial_hex,
                fingerprint=fp,
                expires_at=not_after,
                revoked_at=None,
            )
            session.add(row)
            session.flush()

    return {
        "certPem": cert_pem,
        "keyPem": key_pem,
        "caChainPem": ca_chain_pem.decode() if isinstance(ca_chain_pem, bytes) else str(ca_chain_pem),
        "serial": serial_hex,
        "fingerprint": fp,
        "expiresAt": not_after.isoformat(),
    }


def verify_agent_certificate(*, agent_id: str, tenant_id: str, cert_pem: str) -> bool:
    if not cert_pem.strip():
        return False
    try:
        from cryptography import x509
        from cryptography.hazmat.primitives import serialization

        cert = x509.load_pem_x509_certificate(cert_pem.encode())
        fp = _fingerprint(cert_pem.encode())
        san = f"{agent_id}.{tenant_id}"
        dns_names = []
        try:
            san_ext = cert.extensions.get_extension_for_class(x509.SubjectAlternativeName)
            dns_names = [n.value for n in san_ext.value if isinstance(n, x509.DNSName)]
        except x509.ExtensionNotFound:
            pass
        if san not in dns_names and cert.subject.get_attributes_for_oid(x509.oid.NameOID.COMMON_NAME)[0].value != san:
            return False
        if cert.not_valid_after_utc.replace(tzinfo=timezone.utc) < _utcnow():
            return False
    except Exception:
        return False

    if not persistence_enabled():
        return True

    from app.db.models import AgentCertificate

    with db_session() as session:
        row = (
            session.query(AgentCertificate)
            .filter(
                AgentCertificate.agent_id == agent_id,
                AgentCertificate.tenant_id == tenant_id,
                AgentCertificate.fingerprint == fp,
                AgentCertificate.revoked_at.is_(None),
            )
            .first()
        )
        return row is not None


def revoke_agent_certificate(*, agent_id: str, tenant_id: str) -> int:
    if not persistence_enabled():
        return 0
    from app.db.models import AgentCertificate

    with db_session() as session:
        rows = (
            session.query(AgentCertificate)
            .filter(
                AgentCertificate.agent_id == agent_id,
                AgentCertificate.tenant_id == tenant_id,
                AgentCertificate.revoked_at.is_(None),
            )
            .all()
        )
        now = _utcnow()
        for row in rows:
            row.revoked_at = now
        session.flush()
        return len(rows)
