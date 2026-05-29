from __future__ import annotations

import ipaddress
import os
import socket
from urllib.parse import urlparse

DEFAULT_ALLOWED_PORTS = {22, 25, 465, 587, 993, 443, 8443, 4433}
BLOCKED_METADATA_HOSTS = {"169.254.169.254", "metadata.google.internal"}


class ScanSafetyError(ValueError):
    pass


def live_scan_enabled() -> bool:
    raw = os.getenv("QTANGL_PQC_ENABLE_LIVE_SCAN", "true").lower()
    return raw in {"1", "true", "yes", "on"}


def scan_timeout_seconds() -> float:
    raw = os.getenv("QTANGL_PQC_SCAN_TIMEOUT", "8")
    try:
        return max(2.0, float(raw))
    except ValueError:
        return 8.0


def max_endpoints() -> int:
    raw = os.getenv("QTANGL_PQC_MAX_ENDPOINTS", "24")
    try:
        return max(1, int(raw))
    except ValueError:
        return 24


def allowed_ports(extra: list[int] | None = None) -> set[int]:
    ports = set(DEFAULT_ALLOWED_PORTS)
    if extra:
        ports.update(int(port) for port in extra)
    return ports


def _allowlist() -> set[str] | None:
    raw = os.getenv("QTANGL_PQC_SCAN_ALLOWLIST", "").strip()
    if not raw:
        return None
    return {item.strip().lower() for item in raw.split(",") if item.strip()}


def normalize_host(target: str) -> str:
    cleaned = target.strip()
    if "://" in cleaned:
        parsed = urlparse(cleaned)
        cleaned = parsed.hostname or cleaned
    return cleaned.rstrip(".").lower()


def _is_blocked_ip(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    return bool(
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
        or str(ip) in BLOCKED_METADATA_HOSTS
    )


def assert_scannable(host: str, *, port: int | None = None, extra_ports: list[int] | None = None) -> str:
    if not live_scan_enabled():
        raise ScanSafetyError(
            "Live PQC scanning is disabled on this deployment. Use fixture mode or enable QTANGL_PQC_ENABLE_LIVE_SCAN."
        )

    normalized = normalize_host(host)
    if not normalized:
        raise ScanSafetyError("Target host is required.")

    allowlist = _allowlist()
    if allowlist is not None and normalized not in allowlist:
        raise ScanSafetyError(f"Host '{normalized}' is not in QTANGL_PQC_SCAN_ALLOWLIST.")

    if normalized in BLOCKED_METADATA_HOSTS:
        raise ScanSafetyError("Target host is blocked for safety.")

    if port is not None and port not in allowed_ports(extra_ports):
        raise ScanSafetyError(f"Port {port} is not in the PQC scan allowlist.")

    try:
        addr_infos = socket.getaddrinfo(normalized, port or 443, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise ScanSafetyError(f"Could not resolve host '{normalized}': {exc}") from exc

    for info in addr_infos:
        sockaddr = info[4]
        ip_str = sockaddr[0]
        try:
            ip = ipaddress.ip_address(ip_str)
        except ValueError:
            continue
        if _is_blocked_ip(ip):
            raise ScanSafetyError(f"Resolved address {ip_str} is not permitted for scanning.")

    return normalized
