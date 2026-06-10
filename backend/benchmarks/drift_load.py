"""Load harness: 1k snapshot writes (in-memory / no-op when persistence off)."""

from __future__ import annotations

import time

from app.monitoring.drift_snapshots import compute_snapshot_hash


def run_load(*, iterations: int = 1000) -> dict[str, float]:
    start = time.perf_counter()
    for i in range(iterations):
        compute_snapshot_hash({"findingIds": [f"id-{i}", f"id-{i + 1}"]})
    elapsed = time.perf_counter() - start
    return {"iterations": iterations, "elapsedSec": elapsed, "perOpMs": (elapsed / iterations) * 1000}


if __name__ == "__main__":
    print(run_load())
