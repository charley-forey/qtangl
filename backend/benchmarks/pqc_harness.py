"""Benchmark fixture PQC scans."""

from __future__ import annotations

import sys
from pathlib import Path
from time import perf_counter

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan


def main() -> None:
    dataset = load_dataset()
    started = perf_counter()
    bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
    elapsed = perf_counter() - started
    print(
        f"scan_id={bundle.scan_id} assets={len(bundle.assets)} "
        f"backlog={len(bundle.remediation_backlog)} wall={elapsed:.3f}s"
    )


if __name__ == "__main__":
    main()
