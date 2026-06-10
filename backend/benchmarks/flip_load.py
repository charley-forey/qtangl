"""Benchmark crypto flip dry-run throughput."""

from __future__ import annotations

import os
import time

os.environ.setdefault("CRYPTO_FLIP_ENABLED", "true")
os.environ.setdefault("PERSISTENCE_ENABLED", "false")


def main() -> None:
    from app.remediation.flip import dry_run

    tenant_id = "benchmark"
    n = int(os.environ.get("FLIP_BENCHMARK_N", "100"))
    start = time.perf_counter()
    ok = 0
    for i in range(n):
        result = dry_run(
            tenant_id=tenant_id,
            program_item_id=f"prog-{i}",
            flip_surface="overlay",
            provider="github",
            target_env="staging",
            request={"repo": "org/repo"},
            actor="benchmark",
        )
        if result.get("ok"):
            ok += 1
    elapsed = time.perf_counter() - start
    rate = n / elapsed if elapsed > 0 else 0
    print(f"dry_runs={n} ok={ok} elapsed_sec={elapsed:.2f} rate_per_sec={rate:.1f}")


if __name__ == "__main__":
    main()
