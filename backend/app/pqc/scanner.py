"""Live and fixture PQC scanning.

Live scan entry points (B1 audit):
  1. POST /pqc/scan with useFixture=false
     -> app.api.pqc.scan_pqc -> run_job_async -> run_pqc_scan(use_fixture=False) -> scan_live()
  2. run_pqc_scan(..., use_fixture=False) when called directly (benchmarks/tests)
  3. scan_live() per-endpoint helpers: scan_tls_endpoint, scan_jwks, scan_ssh_banner,
     scan_email_starttls, discover_ct_subdomains (all call assert_scannable)

Fixture path bypasses outbound network: scan_fixture() only.
"""
from __future__ import annotations

from dataclasses import replace
import hashlib
import json
import ssl
import urllib.request
from datetime import datetime, timezone
from typing import Any, Callable

from app.pqc.data import _build_asset
from app.pqc.models import CryptoAsset, PqcDataset, ScanCoverageEntry, ScanScenario, TimelineEvent
from app.pqc.safety import (
    max_endpoints,
    resolve_scannable,
    safe_create_connection,
    safe_json_from_url,
    safe_urlopen,
    scan_timeout_seconds,
)
from app.pqc.vulnerability import classify_algorithm, classify_from_cert_fields

try:
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend
    from cryptography.x509.oid import ExtensionOID

    _HAS_CRYPTOGRAPHY = True
except ImportError:  # pragma: no cover
    _HAS_CRYPTOGRAPHY = False


ScanResult = tuple[CryptoAsset | None, dict[str, Any] | None]


def _asset_id(kind: str, host: str, port: int | None) -> str:
    port_part = port if port is not None else 0
    return f"{kind}-{host.replace('.', '-')}-{port_part}"


def _is_pqc_hybrid_group(group: str | None) -> bool:
    if not group:
        return False
    lower = str(group).lower()
    return any(token in lower for token in ("mlkem", "kyber", "ml-kem", "x25519mlkem"))


def _coverage_entry(
    host: str,
    port: int | None,
    kind: str,
    *,
    status: str,
    detail: str,
) -> dict[str, Any]:
    return ScanCoverageEntry(
        host=host,
        port=port,
        kind=kind,
        status=status,  # type: ignore[arg-type]
        detail=detail,
    ).to_dict()


def _negotiated_group(tls_sock: ssl.SSLSocket) -> str | None:
    shared = getattr(tls_sock, "shared_groups", None)
    if callable(shared):
        try:
            groups = shared()
            if groups:
                if isinstance(groups, (list, tuple)):
                    return ", ".join(str(item) for item in groups)
                return str(groups)
        except Exception:
            pass
    group = getattr(tls_sock, "group", None)
    if callable(group):
        try:
            value = group()
            return str(value) if value else None
        except Exception:
            return None
    return str(group) if group else None


def _chain_length(tls_sock: ssl.SSLSocket) -> int:
    getter = getattr(tls_sock, "get_verified_chain", None)
    if not callable(getter):
        return 0
    try:
        chain = getter()
        return len(chain) if chain else 0
    except Exception:
        return 0


def _extract_sans(cert: Any, host: str) -> list[str]:
    try:
        san_ext = cert.extensions.get_extension_for_oid(ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
        return [str(name.value) for name in san_ext.value]
    except Exception:
        return [host]


def _parse_cert_asset(
    *,
    host: str,
    port: int,
    cert_der: bytes,
    negotiated: dict[str, Any],
    label: str,
    kind: str = "tls",
) -> CryptoAsset:
    group = negotiated.get("group")
    pqc_ready = _is_pqc_hybrid_group(group if isinstance(group, str) else None)

    if not _HAS_CRYPTOGRAPHY:
        vuln = classify_algorithm("RSA", key_size=2048)
        return CryptoAsset(
            id=_asset_id(kind, host, port),
            kind=kind,  # type: ignore[arg-type]
            host=host,
            port=port,
            label=label,
            algorithm=vuln.algorithm,
            key_size=2048,
            validity_days=None,
            san_domains=[host],
            negotiated_cipher=negotiated.get("cipher"),
            negotiated_group=negotiated.get("group"),
            tls_version=negotiated.get("version"),
            vulnerability=vuln,
            hndl_verdict="",
            already_too_late=False,
            mosca_priority=0,
            standards_refs=[],
            pqc_ready=pqc_ready,
            metadata={"note": "cryptography package not installed; limited introspection"},
        )

    cert = x509.load_der_x509_certificate(cert_der, default_backend())
    pub = cert.public_key()
    key_size = getattr(pub, "key_size", None)
    algo = type(pub).__name__.replace("PublicKey", "")
    sig = cert.signature_algorithm_oid._name if cert.signature_algorithm_oid else None
    vuln = classify_from_cert_fields(algo, key_size, sig)
    san_domains = _extract_sans(cert, host)
    not_before = cert.not_valid_before_utc.replace(tzinfo=timezone.utc)
    not_after = cert.not_valid_after_utc.replace(tzinfo=timezone.utc)
    validity_days = max(0, (not_after - datetime.now(timezone.utc)).days)
    return CryptoAsset(
        id=_asset_id(kind, host, port),
        kind=kind,  # type: ignore[arg-type]
        host=host,
        port=port,
        label=label,
        algorithm=vuln.algorithm,
        key_size=key_size,
        validity_days=validity_days,
        san_domains=san_domains,
        negotiated_cipher=negotiated.get("cipher"),
        negotiated_group=negotiated.get("group"),
        tls_version=negotiated.get("version"),
        vulnerability=vuln,
        hndl_verdict="Hybrid PQC negotiated" if pqc_ready else "",
        already_too_late=False,
        mosca_priority=0,
        standards_refs=[],
        pqc_ready=pqc_ready,
        metadata={
            "subject": cert.subject.rfc4514_string(),
            "issuer": cert.issuer.rfc4514_string(),
            "signatureAlgorithm": sig or "",
            "notBefore": not_before.isoformat(),
            "notAfter": not_after.isoformat(),
            "chainLength": negotiated.get("chainLength", 0),
            "publicKeyType": algo,
            "spkiFingerprint": hashlib.sha256(cert_der).hexdigest()[:16],
            "tlsHygiene": _tls_hygiene_findings(negotiated, validity_days),
        },
    )


def _tls_hygiene_findings(negotiated: dict[str, Any], validity_days: int | None) -> list[str]:
    findings: list[str] = []
    version = str(negotiated.get("version", ""))
    if version in {"TLSv1", "TLSv1.1", "SSLv3"}:
        findings.append(f"Legacy protocol negotiated: {version}")
    cipher = str(negotiated.get("cipher", "") or "")
    if cipher and any(weak in cipher.upper() for weak in ("RC4", "DES", "NULL", "EXPORT", "MD5")):
        findings.append(f"Weak/legacy cipher: {cipher}")
    if validity_days is not None and validity_days <= 30:
        findings.append(f"Certificate expires within {validity_days} days")
    chain = int(negotiated.get("chainLength", 0) or 0)
    if chain > 4:
        findings.append(f"Deep certificate chain ({chain} certificates)")
    return findings


def _probe_hsts(host: str, port: int) -> list[str]:
    findings: list[str] = []
    try:
        url = f"https://{host}:{port}/" if port != 443 else f"https://{host}/"
        with safe_urlopen(url, timeout=scan_timeout_seconds()) as response:
            headers = response.headers
            if "strict-transport-security" not in headers:
                findings.append("Missing HSTS (Strict-Transport-Security) header")
    except Exception:
        pass
    return findings


def scan_db_tls(host: str, port: int = 5432) -> ScanResult:
    """Probe Postgres/MySQL TLS (best-effort)."""
    return scan_tls_endpoint(host, port)


def scan_vpn_banner(host: str, port: int = 500) -> ScanResult:
    target = resolve_scannable(host, port=port)
    try:
        with safe_create_connection(target, timeout=scan_timeout_seconds()) as sock:
            banner = sock.recv(256).decode("utf-8", errors="replace")
        if "IKE" in banner.upper() or "VPN" in banner.upper() or banner.strip():
            vuln = classify_algorithm("IKE/ESP", context="tls")
            return (
                CryptoAsset(
                    id=_asset_id("vpn", target.host, port),
                    kind="vpn",
                    host=target.host,
                    port=port,
                    label=f"VPN/IKE endpoint ({port})",
                    algorithm="IKE/ESP",
                    key_size=None,
                    validity_days=None,
                    san_domains=[],
                    negotiated_cipher=None,
                    negotiated_group=None,
                    tls_version=None,
                    vulnerability=vuln,
                    hndl_verdict="",
                    already_too_late=False,
                    mosca_priority=0,
                    standards_refs=[],
                    metadata={"banner": banner.strip()[:120]},
                ),
                None,
            )
    except Exception as exc:
        return None, _coverage_entry(target.host, port, "vpn", status="unreachable", detail=str(exc))
    return None, None


def scan_tls_endpoint(host: str, port: int) -> ScanResult:
    target = resolve_scannable(host, port=port)
    timeout = scan_timeout_seconds()
    context = ssl.create_default_context()
    try:
        with safe_create_connection(target, timeout=timeout) as sock:
            with context.wrap_socket(sock, server_hostname=target.host) as tls_sock:
                cert_der = tls_sock.getpeercert(binary_form=True)
                negotiated = {
                    "cipher": tls_sock.cipher()[0] if tls_sock.cipher() else None,
                    "version": tls_sock.version(),
                    "group": _negotiated_group(tls_sock),
                    "chainLength": _chain_length(tls_sock),
                }
        if not cert_der:
            return None, _coverage_entry(
                target.host,
                port,
                "tls",
                status="error",
                detail="No peer certificate returned",
            )
        asset = _parse_cert_asset(
            host=target.host,
            port=port,
            cert_der=cert_der,
            negotiated=negotiated,
            label=f"TLS {target.host}:{port}",
        )
        hygiene = list(asset.metadata.get("tlsHygiene", []))
        hygiene.extend(_probe_hsts(target.host, port))
        meta = dict(asset.metadata)
        meta["tlsHygiene"] = hygiene
        from dataclasses import replace

        return replace(asset, metadata=meta), None
    except Exception as exc:
        return None, _coverage_entry(
            target.host,
            port,
            "tls",
            status="unreachable",
            detail=str(exc),
        )


def scan_jwks(host: str, port: int = 443) -> ScanResult:
    target = resolve_scannable(host, port=port)
    url = f"https://{target.host}/.well-known/openid-configuration"
    try:
        config = safe_json_from_url(url, timeout=scan_timeout_seconds())
        jwks_uri = config.get("jwks_uri")
        if not jwks_uri:
            return None, None
        jwks = safe_json_from_url(str(jwks_uri), timeout=scan_timeout_seconds())
        keys = jwks.get("keys", [])
        if not keys:
            return None, None
        key = keys[0]
        alg = key.get("alg", "RS256")
        vuln = classify_algorithm(alg, context="jwks")
        return (
            CryptoAsset(
                id=_asset_id("jwks", target.host, port),
                kind="jwks",
                host=target.host,
                port=port,
                label=f"OIDC JWKS ({alg})",
                algorithm=alg,
                key_size=key.get("n") and len(key["n"]) * 4 or None,
                validity_days=None,
                san_domains=[],
                negotiated_cipher=None,
                negotiated_group=None,
                tls_version=None,
                vulnerability=vuln,
                hndl_verdict="",
                already_too_late=False,
                mosca_priority=0,
                standards_refs=[],
                metadata={"jwksUri": jwks_uri, "kid": key.get("kid")},
            ),
            None,
        )
    except (json.JSONDecodeError, TimeoutError, OSError):
        return None, None


def scan_ssh_banner(host: str, port: int = 22) -> ScanResult:
    target = resolve_scannable(host, port=port)
    try:
        with safe_create_connection(target, timeout=scan_timeout_seconds()) as sock:
            banner = sock.recv(256).decode("utf-8", errors="replace")
        algo = "ssh-rsa" if "ssh-rsa" in banner.lower() else "ssh-ed25519"
        vuln = classify_algorithm(algo, key_size=3072 if "rsa" in algo else None, context="ssh")
        return (
            CryptoAsset(
                id=_asset_id("ssh", target.host, port),
                kind="ssh",
                host=target.host,
                port=port,
                label=f"SSH host key ({algo})",
                algorithm=algo,
                key_size=3072 if "rsa" in algo else 256,
                validity_days=None,
                san_domains=[],
                negotiated_cipher=None,
                negotiated_group=None,
                tls_version=None,
                vulnerability=vuln,
                hndl_verdict="",
                already_too_late=False,
                mosca_priority=0,
                standards_refs=[],
                metadata={"banner": banner.strip()},
            ),
            None,
        )
    except Exception as exc:
        return None, _coverage_entry(
            target.host,
            port,
            "ssh",
            status="unreachable",
            detail=str(exc),
        )


def fetch_mta_sts_policy(domain: str) -> dict[str, Any] | None:
    target = resolve_scannable(domain)
    url = f"https://mta-sts.{target.host}/.well-known/mta-sts.txt"
    try:
        with safe_urlopen(url, timeout=scan_timeout_seconds()) as response:
            text = response.read().decode("utf-8", errors="replace")
        return {"policyUrl": url, "excerpt": text[:240]}
    except Exception:
        return None


def scan_email_starttls(host: str, port: int) -> ScanResult:
    target = resolve_scannable(host, port=port)
    try:
        with safe_create_connection(target, timeout=scan_timeout_seconds()) as sock:
            sock.sendall(b"EHLO qtangl-scan.local\r\n")
            banner = sock.recv(512).decode("utf-8", errors="replace")
            if port in {25, 587}:
                sock.sendall(b"STARTTLS\r\n")
                reply = sock.recv(512).decode("utf-8", errors="replace")
                if "220" not in reply:
                    return None, _coverage_entry(
                        target.host,
                        port,
                        "email",
                        status="error",
                        detail=reply.strip() or "STARTTLS rejected",
                    )
                context = ssl.create_default_context()
                tls_sock = context.wrap_socket(sock, server_hostname=target.host)
                cert_der = tls_sock.getpeercert(binary_form=True)
                if cert_der:
                    return (
                        _parse_cert_asset(
                            host=target.host,
                            port=port,
                            cert_der=cert_der,
                            negotiated={
                                "cipher": tls_sock.cipher()[0] if tls_sock.cipher() else None,
                                "version": tls_sock.version(),
                                "group": _negotiated_group(tls_sock),
                                "chainLength": _chain_length(tls_sock),
                            },
                            label=f"SMTP STARTTLS {target.host}:{port}",
                            kind="email",
                        ),
                        None,
                    )
            elif port == 993:
                context = ssl.create_default_context()
                tls_sock = context.wrap_socket(sock, server_hostname=target.host)
                cert_der = tls_sock.getpeercert(binary_form=True)
                if cert_der:
                    return (
                        _parse_cert_asset(
                            host=target.host,
                            port=port,
                            cert_der=cert_der,
                            negotiated={
                                "cipher": tls_sock.cipher()[0] if tls_sock.cipher() else None,
                                "version": tls_sock.version(),
                                "group": _negotiated_group(tls_sock),
                                "chainLength": _chain_length(tls_sock),
                            },
                            label=f"IMAPS {target.host}:{port}",
                            kind="email",
                        ),
                        None,
                    )
        return None, _coverage_entry(
            target.host,
            port,
            "email",
            status="unreachable",
            detail="No TLS certificate obtained from mail endpoint",
        )
    except Exception as exc:
        return None, _coverage_entry(
            target.host,
            port,
            "email",
            status="unreachable",
            detail=str(exc),
        )


def discover_ct_subdomains(domain: str) -> list[str]:
    target = resolve_scannable(domain)
    url = f"https://crt.sh/?q=%25.{target.host}&output=json"
    try:
        with urllib.request.urlopen(url, timeout=scan_timeout_seconds()) as response:
            payload = json.loads(response.read().decode("utf-8"))
        names: set[str] = set()
        for entry in payload[:50]:
            name_value = entry.get("name_value", "")
            for name in name_value.split("\n"):
                cleaned = name.strip().lower()
                if cleaned.endswith(target.host) and cleaned != target.host:
                    names.add(cleaned)
        return sorted(names)[: max_endpoints()]
    except Exception:
        return []


def _live_probe_ports(scenario: ScanScenario, *, target_override: str | None) -> list[int]:
    if target_override:
        return [443]
    return list(scenario.target.ports or [443])


def _build_live_endpoints(
    domain: str,
    ports: list[int],
    subdomains: list[str],
    uploaded_rows: list[dict[str, Any]] | None,
) -> list[tuple[str, int, str]]:
    if uploaded_rows:
        return [(row["host"], int(row["port"]), row.get("kind", "tls")) for row in uploaded_rows]

    declared = set(ports)
    endpoints: list[tuple[str, int, str]] = []
    hosts = [domain, *subdomains[:5]]
    for host in hosts:
        for port in sorted(declared):
            endpoints.append((host, port, "tls"))
    if 22 in declared:
        endpoints.append((domain, 22, "ssh"))
    for mail_port in (25, 587, 993):
        if mail_port in declared:
            endpoints.append((domain, mail_port, "email"))
    if 5432 in declared:
        endpoints.append((domain, 5432, "db_tls"))
    if 500 in declared:
        endpoints.append((domain, 500, "vpn"))
    return endpoints


def fixture_assets_for_scenario(dataset: PqcDataset, scenario: ScanScenario) -> list[CryptoAsset]:
    if scenario.fixture_asset_ids:
        by_id = {asset.id: asset for asset in dataset.inventory}
        return [by_id[asset_id] for asset_id in scenario.fixture_asset_ids if asset_id in by_id]
    return list(dataset.inventory)


def scan_live(
    scenario: ScanScenario,
    *,
    target_override: str | None = None,
    uploaded_rows: list[dict[str, Any]] | None = None,
    on_progress: Callable[[TimelineEvent], None] | None = None,
) -> tuple[list[CryptoAsset], list[TimelineEvent], list[dict[str, Any]]]:
    domain = target_override or scenario.target.domain
    ports = _live_probe_ports(scenario, target_override=target_override)
    timeline: list[TimelineEvent] = []
    assets: list[CryptoAsset] = []
    coverage: list[dict[str, Any]] = []

    def emit(key: str, label: str, duration_ms: int = 0, status: str = "done") -> None:
        event = TimelineEvent(key=key, label=label, duration_ms=duration_ms, status=status)
        timeline.append(event)
        if on_progress:
            on_progress(event)

    emit("resolve", f"Resolved target {domain}")
    emit("ct", "Enumerating certificate transparency logs…")
    subdomains = discover_ct_subdomains(domain)
    if subdomains:
        emit("ct_done", f"CT logs surfaced {len(subdomains)} hostnames")
    else:
        emit("ct_done", "CT enumeration skipped or empty (continuing with declared ports)")

    endpoints = _build_live_endpoints(domain, ports, subdomains, uploaded_rows)
    endpoints = endpoints[: max_endpoints()]

    for index, (host, port, kind) in enumerate(endpoints):
        emit("tls", f"Scanning {kind} {host}:{port} ({index + 1}/{len(endpoints)})")
        if kind == "jwks":
            asset, cov = scan_jwks(host, port)
        elif kind == "ssh":
            asset, cov = scan_ssh_banner(host, port)
        elif kind == "email":
            asset, cov = scan_email_starttls(host, port)
        elif kind == "vpn":
            asset, cov = scan_vpn_banner(host, port)
        elif kind == "db_tls":
            asset, cov = scan_db_tls(host, port)
        elif kind in {"smime", "mtls", "code_signing", "document_signing"}:
            asset, cov = scan_tls_endpoint(host, port)
            if asset:
                asset = replace(
                    asset,
                    kind=kind,  # type: ignore[arg-type]
                    label=f"{kind.upper()} {asset.label}",
                )
        else:
            asset, cov = scan_tls_endpoint(host, port)
        if asset:
            assets.append(asset)
        if cov:
            coverage.append(cov)

    jwks_asset, jwks_cov = scan_jwks(domain)
    if jwks_asset:
        assets.append(jwks_asset)
    if jwks_cov:
        coverage.append(jwks_cov)

    emit("classify", f"Classified {len(assets)} cryptographic assets")
    if coverage:
        emit(
            "coverage",
            f"{len(coverage)} endpoint(s) unreachable or errored (listed in scan coverage, not inventory)",
            status="skipped",
        )
    return assets, timeline, coverage


def scan_fixture(
    dataset: PqcDataset,
    scenario: ScanScenario,
    *,
    uploaded_rows: list[dict[str, Any]] | None = None,
) -> tuple[list[CryptoAsset], list[TimelineEvent], list[dict[str, Any]]]:
    timeline = [
        TimelineEvent(key="fixture", label="Replaying curated PQC inventory fixture", duration_ms=120, status="replayed"),
        TimelineEvent(key="classify", label="Classifying fixture assets", duration_ms=80, status="replayed"),
    ]
    assets = fixture_assets_for_scenario(dataset, scenario)
    if uploaded_rows:
        for index, row in enumerate(uploaded_rows):
            payload = {
                "id": f"upload-{index}",
                "kind": row.get("kind", "tls"),
                "host": row["host"],
                "port": row.get("port"),
                "label": row.get("label", row["host"]),
                "algorithm": row.get("algorithm", "RSA"),
                "keySize": row.get("keySize", 2048),
            }
            if "vulnerability" in row:
                payload["vulnerability"] = row["vulnerability"]
            assets.append(_build_asset(payload))
    return assets, timeline, []


def flag_key_reuse(assets: list[CryptoAsset]) -> list[CryptoAsset]:
    """Detect same SPKI fingerprint across hosts — high-signal finding."""
    from dataclasses import replace

    by_fp: dict[str, list[CryptoAsset]] = {}
    for asset in assets:
        fp = asset.metadata.get("spkiFingerprint")
        if not fp:
            continue
        by_fp.setdefault(str(fp), []).append(asset)

    updated: list[CryptoAsset] = []
    for asset in assets:
        fp = asset.metadata.get("spkiFingerprint")
        if fp and len(by_fp.get(str(fp), [])) > 1:
            peers = [a.host for a in by_fp[str(fp)] if a.id != asset.id]
            meta = dict(asset.metadata)
            meta["keyReusePeers"] = peers
            finding = f"Same public key fingerprint as: {', '.join(peers[:5])}"
            meta["keyReuseFinding"] = finding
            updated.append(
                replace(
                    asset,
                    metadata=meta,
                    hndl_verdict=asset.hndl_verdict or finding,
                )
            )
        else:
            updated.append(asset)
    return updated
