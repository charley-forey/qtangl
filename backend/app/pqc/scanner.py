"""Live and fixture PQC scanning.

Live scan entry points (B1 audit):
  1. POST /pqc/scan with useFixture=false
     -> app.api.pqc.scan_pqc -> run_job_async -> run_pqc_scan(use_fixture=False) -> scan_live()
  2. run_pqc_scan(..., use_fixture=False) when called directly (benchmarks/tests)
  3. scan_live() per-endpoint helpers: scan_tls_endpoint, scan_jwks, scan_ssh_banner,
     scan_email_starttls, discover_ct_subdomains (all call assert_scannable)

Fixture path bypasses outbound network: scan_fixture() only.
"""
import json
import socket
import ssl
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any, Callable

from app.pqc.data import _build_asset
from app.pqc.models import CryptoAsset, PqcDataset, ScanScenario, TimelineEvent
from app.pqc.safety import assert_scannable, max_endpoints, scan_timeout_seconds
from app.pqc.vulnerability import classify_algorithm, classify_from_cert_fields

try:
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend

    _HAS_CRYPTOGRAPHY = True
except ImportError:  # pragma: no cover
    _HAS_CRYPTOGRAPHY = False


def _asset_id(kind: str, host: str, port: int | None) -> str:
    port_part = port if port is not None else 0
    return f"{kind}-{host.replace('.', '-')}-{port_part}"


def _error_asset(host: str, port: int | None, label: str, detail: str) -> CryptoAsset:
    vuln = classify_algorithm("unknown")
    return CryptoAsset(
        id=_asset_id("error", host, port),
        kind="error",
        host=host,
        port=port,
        label=label,
        algorithm="unknown",
        key_size=None,
        validity_days=None,
        san_domains=[],
        negotiated_cipher=None,
        negotiated_group=None,
        tls_version=None,
        vulnerability=vuln,
        hndl_verdict=detail,
        already_too_late=False,
        mosca_priority=0,
        standards_refs=[],
        metadata={"error": detail},
    )


def _parse_cert_asset(
    *,
    host: str,
    port: int,
    cert_der: bytes,
    negotiated: dict[str, Any],
    label: str,
) -> CryptoAsset:
    if not _HAS_CRYPTOGRAPHY:
        vuln = classify_algorithm("RSA", key_size=2048)
        return CryptoAsset(
            id=_asset_id("tls", host, port),
            kind="tls",
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
            metadata={"note": "cryptography package not installed; limited introspection"},
        )

    cert = x509.load_der_x509_certificate(cert_der, default_backend())
    pub = cert.public_key()
    key_size = getattr(pub, "key_size", None)
    algo = type(pub).__name__.replace("PublicKey", "")
    sig = cert.signature_algorithm_oid._name if cert.signature_algorithm_oid else None
    vuln = classify_from_cert_fields(algo, key_size, sig)
    try:
        san = [name.value for name in cert.extensions if hasattr(name, "value")]
    except Exception:
        san = [host]
    not_after = cert.not_valid_after_utc.replace(tzinfo=timezone.utc)
    validity_days = max(0, (not_after - datetime.now(timezone.utc)).days)
    return CryptoAsset(
        id=_asset_id("tls", host, port),
        kind="tls",
        host=host,
        port=port,
        label=label,
        algorithm=vuln.algorithm,
        key_size=key_size,
        validity_days=validity_days,
        san_domains=[host],
        negotiated_cipher=negotiated.get("cipher"),
        negotiated_group=negotiated.get("group"),
        tls_version=negotiated.get("version"),
        vulnerability=vuln,
        hndl_verdict="",
        already_too_late=False,
        mosca_priority=0,
        standards_refs=[],
        metadata={"subject": str(cert.subject)},
    )


def scan_tls_endpoint(host: str, port: int) -> CryptoAsset:
    safe_host = assert_scannable(host, port=port)
    timeout = scan_timeout_seconds()
    context = ssl.create_default_context()
    try:
        with socket.create_connection((safe_host, port), timeout=timeout) as sock:
            with context.wrap_socket(sock, server_hostname=safe_host) as tls_sock:
                cert_der = tls_sock.getpeercert(binary_form=True)
                negotiated = {
                    "cipher": tls_sock.cipher()[0] if tls_sock.cipher() else None,
                    "version": tls_sock.version(),
                    "group": getattr(tls_sock, "shared_groups", lambda: None)(),
                }
        if not cert_der:
            return _error_asset(safe_host, port, f"TLS {safe_host}:{port}", "No peer certificate returned")
        return _parse_cert_asset(
            host=safe_host,
            port=port,
            cert_der=cert_der,
            negotiated=negotiated,
            label=f"TLS {safe_host}:{port}",
        )
    except Exception as exc:
        return _error_asset(safe_host, port, f"TLS {safe_host}:{port}", str(exc))


def scan_jwks(host: str, port: int = 443) -> CryptoAsset | None:
    safe_host = assert_scannable(host, port=port)
    url = f"https://{safe_host}/.well-known/openid-configuration"
    try:
        with urllib.request.urlopen(url, timeout=scan_timeout_seconds()) as response:
            config = json.loads(response.read().decode("utf-8"))
        jwks_uri = config.get("jwks_uri")
        if not jwks_uri:
            return None
        with urllib.request.urlopen(jwks_uri, timeout=scan_timeout_seconds()) as jwks_response:
            jwks = json.loads(jwks_response.read().decode("utf-8"))
        keys = jwks.get("keys", [])
        if not keys:
            return None
        key = keys[0]
        alg = key.get("alg", "RS256")
        vuln = classify_algorithm(alg, context="jwks")
        return CryptoAsset(
            id=_asset_id("jwks", safe_host, port),
            kind="jwks",
            host=safe_host,
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
        )
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError):
        return None


def scan_ssh_banner(host: str, port: int = 22) -> CryptoAsset | None:
    safe_host = assert_scannable(host, port=port)
    try:
        with socket.create_connection((safe_host, port), timeout=scan_timeout_seconds()) as sock:
            banner = sock.recv(256).decode("utf-8", errors="replace")
        algo = "ssh-rsa" if "ssh-rsa" in banner.lower() else "ssh-ed25519"
        vuln = classify_algorithm(algo, key_size=3072 if "rsa" in algo else None, context="ssh")
        return CryptoAsset(
            id=_asset_id("ssh", safe_host, port),
            kind="ssh",
            host=safe_host,
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
        )
    except Exception:
        return None


def fetch_mta_sts_policy(domain: str) -> dict[str, Any] | None:
    safe_host = assert_scannable(domain)
    url = f"https://mta-sts.{safe_host}/.well-known/mta-sts.txt"
    try:
        with urllib.request.urlopen(url, timeout=scan_timeout_seconds()) as response:
            text = response.read().decode("utf-8", errors="replace")
        return {"policyUrl": url, "excerpt": text[:240]}
    except Exception:
        return None


def scan_email_starttls(host: str, port: int) -> CryptoAsset | None:
    safe_host = assert_scannable(host, port=port)
    try:
        with socket.create_connection((safe_host, port), timeout=scan_timeout_seconds()) as sock:
            sock.sendall(b"EHLO qtangl-scan.local\r\n")
            banner = sock.recv(512).decode("utf-8", errors="replace")
            if port in {25, 587}:
                sock.sendall(b"STARTTLS\r\n")
                reply = sock.recv(512).decode("utf-8", errors="replace")
                if "220" not in reply:
                    return _error_asset(safe_host, port, f"SMTP STARTTLS {safe_host}:{port}", reply.strip())
                context = ssl.create_default_context()
                tls_sock = context.wrap_socket(sock, server_hostname=safe_host)
                cert_der = tls_sock.getpeercert(binary_form=True)
                if cert_der:
                    return _parse_cert_asset(
                        host=safe_host,
                        port=port,
                        cert_der=cert_der,
                        negotiated={"cipher": None, "version": tls_sock.version(), "group": None},
                        label=f"SMTP STARTTLS {safe_host}:{port}",
                    )
        vuln = classify_algorithm("RSA", key_size=2048, context="email")
        return CryptoAsset(
            id=_asset_id("email", safe_host, port),
            kind="email",
            host=safe_host,
            port=port,
            label=f"Email transport {safe_host}:{port}",
            algorithm="SMTP",
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
            metadata={"banner": banner.strip(), "mtaSts": fetch_mta_sts_policy(safe_host)},
        )
    except Exception as exc:
        return _error_asset(safe_host, port, f"Email {safe_host}:{port}", str(exc))


def discover_ct_subdomains(domain: str) -> list[str]:
    safe_host = assert_scannable(domain)
    url = f"https://crt.sh/?q=%25.{safe_host}&output=json"
    try:
        with urllib.request.urlopen(url, timeout=scan_timeout_seconds()) as response:
            payload = json.loads(response.read().decode("utf-8"))
        names: set[str] = set()
        for entry in payload[:50]:
            name_value = entry.get("name_value", "")
            for name in name_value.split("\n"):
                cleaned = name.strip().lower()
                if cleaned.endswith(safe_host):
                    names.add(cleaned)
        return sorted(names)[: max_endpoints()]
    except Exception:
        return []


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
) -> tuple[list[CryptoAsset], list[TimelineEvent]]:
    domain = target_override or scenario.target.domain
    ports = scenario.target.ports or [443]
    timeline: list[TimelineEvent] = []
    assets: list[CryptoAsset] = []

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

    endpoints: list[tuple[str, int, str]] = []
    if uploaded_rows:
        for row in uploaded_rows:
            endpoints.append((row["host"], int(row["port"]), row.get("kind", "tls")))
    else:
        hosts = [domain, *subdomains[:5]]
        for host in hosts:
            for port in ports:
                endpoints.append((host, port, "tls"))
        endpoints.append((domain, 22, "ssh"))
        for mail_port in (25, 587, 993):
            if mail_port in ports or mail_port in {25, 993}:
                endpoints.append((domain, mail_port, "email"))

    endpoints = endpoints[: max_endpoints()]
    for index, (host, port, kind) in enumerate(endpoints):
        emit("tls", f"Scanning {kind} {host}:{port} ({index + 1}/{len(endpoints)})")
        if kind == "jwks":
            asset = scan_jwks(host, port)
            if asset:
                assets.append(asset)
        elif kind == "ssh":
            asset = scan_ssh_banner(host, port)
            if asset:
                assets.append(asset)
        elif kind == "email":
            asset = scan_email_starttls(host, port)
            if asset:
                assets.append(asset)
        else:
            assets.append(scan_tls_endpoint(host, port))

    jwks_asset = scan_jwks(domain)
    if jwks_asset:
        assets.append(jwks_asset)

    emit("classify", f"Classified {len(assets)} cryptographic assets")
    return assets, timeline


def scan_fixture(
    dataset: PqcDataset,
    scenario: ScanScenario,
    *,
    uploaded_rows: list[dict[str, Any]] | None = None,
) -> tuple[list[CryptoAsset], list[TimelineEvent]]:
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
    return assets, timeline
