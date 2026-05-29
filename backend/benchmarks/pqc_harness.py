"""Benchmark fixture PQC scans."""

from __future__ import annotations

from time import perf_counter

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
