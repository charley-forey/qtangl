"""Evidence layer observability metrics."""

from __future__ import annotations

import time
from typing import Any

_COUNTERS: dict[str, float] = {}
_GAUGES: dict[str, float] = {}


def increment(name: str, *, value: float = 1.0) -> None:
    _COUNTERS[name] = _COUNTERS.get(name, 0.0) + value


def gauge(name: str, value: float) -> None:
    _GAUGES[name] = value


def time_operation(name: str) -> float:
    return time.perf_counter()


def record_latency(name: str, start: float) -> None:
    ms = (time.perf_counter() - start) * 1000
    gauge(f"{name}_latency_ms", ms)


def prometheus_text() -> str:
    lines: list[str] = []
    for key, val in sorted(_COUNTERS.items()):
        lines.append(f"qtangl_{key}_total {val}")
    for key, val in sorted(_GAUGES.items()):
        lines.append(f"qtangl_{key} {val}")
    return "\n".join(lines) + "\n"


def snapshot() -> dict[str, Any]:
    return {"counters": dict(_COUNTERS), "gauges": dict(_GAUGES)}
