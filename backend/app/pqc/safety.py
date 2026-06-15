from __future__ import annotations

import ipaddress
import json
import os
import socket
import ssl
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Iterator
from urllib.parse import urlparse

DEFAULT_ALLOWED_PORTS = {22, 25, 465, 587, 993, 443, 8443, 4433}
BLOCKED_METADATA_HOSTS = {"169.254.169.254", "metadata.google.internal"}
PUBLIC_DEMO_HOSTS = frozenset(
    {
        "test.openquantumsafe.org",
        "qtangl.com",
        "www.qtangl.com",
    }
)


class ScanSafetyError(ValueError):
    pass


@dataclass(frozen=True)
class ScannableTarget:
    """Resolved scan target with a pinned public IP to prevent DNS rebinding."""

    host: str
    ip: str
    port: int


class _PinnedHTTPResponse:
    def __init__(self, status: int, headers: dict[str, str], body: bytes) -> None:
        self.status = status
        self.headers = headers
        self._body = body

    def read(self) -> bytes:
        return self._body

    def __enter__(self) -> _PinnedHTTPResponse:
        return self

    def __exit__(self, *args: object) -> None:
        return None


def live_scan_enabled() -> bool:
    raw = os.getenv("QTANGL_PQC_ENABLE_LIVE_SCAN", "false").lower()
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


def _env_allowlist() -> set[str] | None:
    raw = os.getenv("QTANGL_PQC_SCAN_ALLOWLIST", "").strip()
    if not raw:
        return None
    return {item.strip().lower() for item in raw.split(",") if item.strip()}


def _strict_public_demo() -> bool:
    raw = os.getenv("QTANGL_PQC_STRICT_PUBLIC_DEMO", "true").lower()
    return raw in {"1", "true", "yes", "on"}


def _demo_live_hosts() -> set[str]:
    """Hosts permitted for live scans on the sandbox tenant (public demo)."""
    env = _env_allowlist()
    if env is None:
        return set(PUBLIC_DEMO_HOSTS)
    if _strict_public_demo():
        return env & set(PUBLIC_DEMO_HOSTS)
    return env


def _tenant_allowlist(tenant_id: str) -> set[str]:
    from app.tenant.settings import get_tenant_scan_allowlist

    return set(get_tenant_scan_allowlist(tenant_id=tenant_id))


def _host_allowed_for_tenant(normalized: str, tenant_id: str | None) -> None:
    if not tenant_id or tenant_id == "sandbox":
        demo_hosts = _demo_live_hosts()
        if normalized not in demo_hosts:
            raise ScanSafetyError(
                f"Host '{normalized}' is not permitted for public demo live scans. "
                "Use fixture mode or scan test.openquantumsafe.org."
            )
        return

    tenant_hosts = _tenant_allowlist(tenant_id)
    if not tenant_hosts:
        raise ScanSafetyError(
            f"No authorized domains configured for tenant '{tenant_id}'. "
            "Add domains via dashboard settings or contact your Qtangl admin."
        )
    if normalized not in tenant_hosts:
        raise ScanSafetyError(
            f"Host '{normalized}' is not on your tenant authorized domain list."
        )


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


def _validated_ips(normalized: str, port: int) -> list[str]:
    try:
        addr_infos = socket.getaddrinfo(normalized, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise ScanSafetyError(f"Could not resolve host '{normalized}': {exc}") from exc

    validated: list[str] = []
    for info in addr_infos:
        sockaddr = info[4]
        ip_str = sockaddr[0]
        try:
            ip = ipaddress.ip_address(ip_str)
        except ValueError:
            continue
        if _is_blocked_ip(ip):
            raise ScanSafetyError(f"Resolved address {ip_str} is not permitted for scanning.")
        if ip_str not in validated:
            validated.append(ip_str)
    if not validated:
        raise ScanSafetyError(f"No permitted addresses resolved for '{normalized}'.")
    return validated


def resolve_scannable(
    host: str,
    *,
    port: int | None = None,
    extra_ports: list[int] | None = None,
    tenant_id: str | None = None,
) -> ScannableTarget:
    if not live_scan_enabled():
        raise ScanSafetyError(
            "Live PQC scanning is disabled on this deployment. Use fixture mode or enable QTANGL_PQC_ENABLE_LIVE_SCAN."
        )

    normalized = normalize_host(host)
    if not normalized:
        raise ScanSafetyError("Target host is required.")

    if tenant_id is None:
        from app.pqc.scan_context import current_scan_tenant_id

        tenant_id = current_scan_tenant_id()

    _host_allowed_for_tenant(normalized, tenant_id)

    if normalized in BLOCKED_METADATA_HOSTS:
        raise ScanSafetyError("Target host is blocked for safety.")

    resolved_port = port or 443
    if port is not None and port not in allowed_ports(extra_ports):
        raise ScanSafetyError(f"Port {port} is not in the PQC scan allowlist.")

    ips = _validated_ips(normalized, resolved_port)
    return ScannableTarget(host=normalized, ip=ips[0], port=resolved_port)


def assert_scannable(
    host: str,
    *,
    port: int | None = None,
    extra_ports: list[int] | None = None,
    tenant_id: str | None = None,
) -> str:
    return resolve_scannable(host, port=port, extra_ports=extra_ports, tenant_id=tenant_id).host


def safe_create_connection(target: ScannableTarget, *, timeout: float | None = None) -> socket.socket:
    return socket.create_connection(
        (target.ip, target.port),
        timeout=timeout if timeout is not None else scan_timeout_seconds(),
    )


def _read_http_response(sock: socket.socket) -> tuple[int, dict[str, str], bytes]:
    buffer = b""
    while b"\r\n\r\n" not in buffer:
        chunk = sock.recv(4096)
        if not chunk:
            break
        buffer += chunk
    header_block, _, body = buffer.partition(b"\r\n\r\n")
    lines = header_block.split(b"\r\n")
    status_line = lines[0].decode("utf-8", errors="replace") if lines else ""
    status = 0
    if status_line.startswith("HTTP/"):
        parts = status_line.split()
        if len(parts) >= 2:
            try:
                status = int(parts[1])
            except ValueError:
                status = 0
    headers: dict[str, str] = {}
    for line in lines[1:]:
        if b":" not in line:
            continue
        key, value = line.split(b":", 1)
        headers[key.decode("utf-8", errors="replace").lower()] = value.decode("utf-8", errors="replace").strip()
    content_length = headers.get("content-length")
    if content_length:
        needed = int(content_length)
        while len(body) < needed:
            chunk = sock.recv(min(4096, needed - len(body)))
            if not chunk:
                break
            body += chunk
    else:
        while True:
            chunk = sock.recv(4096)
            if not chunk:
                break
            body += chunk
    return status, headers, body


@contextmanager
def safe_urlopen(url: str, *, timeout: float | None = None) -> Iterator[_PinnedHTTPResponse]:
    """Fetch a URL using DNS-pinned connections to prevent rebinding SSRF."""
    parsed = urlparse(url)
    if parsed.scheme not in {"https", "http"}:
        raise ScanSafetyError(f"URL scheme not permitted: {parsed.scheme or 'missing'}")

    hostname = parsed.hostname
    if not hostname:
        raise ScanSafetyError("URL host is required.")

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    target = resolve_scannable(hostname, port=port)
    path = parsed.path or "/"
    if parsed.query:
        path = f"{path}?{parsed.query}"

    request = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {target.host}\r\n"
        "Connection: close\r\n"
        "Accept: application/json, text/plain, */*\r\n"
        "\r\n"
    ).encode("utf-8")
    timeout_val = timeout if timeout is not None else scan_timeout_seconds()

    sock = safe_create_connection(target, timeout=timeout_val)
    try:
        if parsed.scheme == "https":
            context = ssl.create_default_context()
            tls_sock = context.wrap_socket(sock, server_hostname=target.host)
            tls_sock.settimeout(timeout_val)
            tls_sock.sendall(request)
            status, headers, body = _read_http_response(tls_sock)
            tls_sock.close()
        else:
            sock.settimeout(timeout_val)
            sock.sendall(request)
            status, headers, body = _read_http_response(sock)
        if status >= 400:
            raise ScanSafetyError(f"HTTP {status} fetching {url}")
        yield _PinnedHTTPResponse(status, headers, body)
    finally:
        try:
            sock.close()
        except OSError:
            pass


def safe_json_from_url(url: str, *, timeout: float | None = None) -> Any:
    with safe_urlopen(url, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))
