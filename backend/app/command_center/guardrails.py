"""Method-honesty guardrails for AI-generated Command Center copy."""

from __future__ import annotations

import re

_BANNED_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bq[- ]?day\b", re.I), "Q-Day prediction"),
    (re.compile(r"\bcertif(?:y|ied|ication)\b", re.I), "certification claim"),
    (re.compile(r"\bbroken today\b", re.I), "broken-today claim"),
    (re.compile(r"\bformal audit\b", re.I), "formal-audit claim"),
    (re.compile(r"\bcmmc attestation\b", re.I), "CMMC attestation claim"),
    (re.compile(r"\b100% coverage\b", re.I), "complete-coverage claim"),
]


def evaluate_method_honesty(text: str) -> tuple[bool, list[str]]:
    violations: list[str] = []
    for pattern, label in _BANNED_PATTERNS:
        if pattern.search(text or ""):
            violations.append(label)
    return (len(violations) == 0, violations)


def sanitize_ai_output(text: str) -> str:
    ok, violations = evaluate_method_honesty(text)
    if ok:
        return text
    disclaimer = (
        "\n\n—\nNote: This inventory aid quantifies exposure from discovered assets; "
        "it is not a formal audit or certification. Verification confirms report signing "
        "integrity only."
    )
    return text.rstrip() + disclaimer
