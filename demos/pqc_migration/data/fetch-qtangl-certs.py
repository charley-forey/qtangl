#!/usr/bin/env python3
"""Fetch live leaf certificates for Qtangl production hosts and write a PEM bundle."""

from __future__ import annotations

import base64
import socket
import ssl
from pathlib import Path

HOSTS = ("qtangl.com", "www.qtangl.com", "api.qtangl.com")
OUTPUT = Path(__file__).with_name("qtangl-production-bundle.pem")


def fetch_pem(host: str) -> str:
    context = ssl.create_default_context()
    with socket.create_connection((host, 443), timeout=15) as sock:
        with context.wrap_socket(sock, server_hostname=host) as ssock:
            der = ssock.getpeercert(binary_form=True)
    b64 = base64.encodebytes(der).decode().replace("\n", "")
    lines = [b64[index : index + 64] for index in range(0, len(b64), 64)]
    return "-----BEGIN CERTIFICATE-----\n" + "\n".join(lines) + "\n-----END CERTIFICATE-----\n"


def main() -> None:
    blocks = [fetch_pem(host) for host in HOSTS]
    OUTPUT.write_text("\n".join(block.rstrip() for block in blocks) + "\n", encoding="utf-8")
    print(f"Wrote {len(blocks)} certificates to {OUTPUT}")


if __name__ == "__main__":
    main()
