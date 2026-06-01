"""Code and dependency crypto discovery (Horizon 3 scaffolding)."""

from __future__ import annotations

import re
from typing import Any


_PATTERNS = [
    (re.compile(r"RSA|ECDSA|Ed25519", re.I), "asymmetric"),
    (re.compile(r"AES-256-GCM|ChaCha20", re.I), "symmetric"),
    (re.compile(r"ML-KEM|ML-DSA|Kyber|Dilithium", re.I), "pqc"),
]


def scan_source_snippet(*, content: str, path: str = "snippet") -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    for pattern, category in _PATTERNS:
        for match in pattern.finditer(content):
            findings.append(
                {
                    "path": path,
                    "match": match.group(0),
                    "category": category,
                    "line": content[: match.start()].count("\n") + 1,
                }
            )
    return findings[:100]
