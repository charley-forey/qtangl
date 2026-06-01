"""Readiness copilot — optional OpenAI-backed explanations."""

from __future__ import annotations

import os
from typing import Any


def explain_finding(*, finding: dict[str, Any], context: str = "") -> dict[str, Any]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "explanation": (
                f"Finding '{finding.get('title', 'item')}' requires migration to "
                f"{finding.get('pqcAlgorithm', 'ML-KEM / ML-DSA')} per NIST PQC standards."
            ),
            "source": "rules",
        }
    try:
        import json
        import urllib.request

        body = json.dumps(
            {
                "model": os.environ.get("QTANGL_COPILOT_MODEL", "gpt-4o-mini"),
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a post-quantum cryptography readiness advisor. Be concise.",
                    },
                    {
                        "role": "user",
                        "content": f"Explain remediation for: {json.dumps(finding)}\nContext: {context}",
                    },
                ],
                "max_tokens": 300,
            }
        ).encode()
        request = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=body,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode())
            text = data["choices"][0]["message"]["content"]
            return {"explanation": text, "source": "openai"}
    except Exception as exc:
        return {"explanation": str(exc), "source": "error"}
