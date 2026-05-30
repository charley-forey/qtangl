# Benchmark results

Committed outputs from Phase 0 baseline runs. Regenerate after solver or dependency changes.

## How to regenerate

From `backend/` with lockfile venv active:

```bash
pip install -r requirements.lock -r requirements-dev.lock
export QTANGL_ENABLE_QAOA=true   # Windows: $env:QTANGL_ENABLE_QAOA="true"

python benchmarks/run_benchmark.py BM-001 --write
python benchmarks/run_benchmark.py BM-002 --write
python benchmarks/run_benchmark.py BM-003 --write
python benchmarks/run_benchmark.py BM-004 --write
python benchmarks/run_benchmark.py BM-005 --write
python benchmarks/run_benchmark.py BM-006 --write
```

Instance definitions live in [`instances/`](instances/).

Full harness CSVs (optional, slower) write to repo-root `benchmarks/` via each harness `main()`.

## Files

| ID | Instance file | Result file | Description |
|----|---------------|-------------|-------------|
| BM-001 | `instances/BM-001-tiny-schedule.json` | `BM-001-tiny-schedule.json` | 3-task schedule: classical vs QAOA |
| BM-002 | `instances/BM-002-five-task-precedence.json` | `BM-002-five-task-precedence.json` | 5-task chain; QAOA skipped (too large) |
| BM-003 | `instances/BM-003-hospital-callout-cath-acls.json` | `BM-003-hospital-summary.json` | 10-run hospital fixture aggregate |
| BM-004 | `instances/BM-004-airline-mx-hold-ord-0612.json` | `BM-004-airline-summary.json` | mx-hold-ord-0612 airline recovery |
| BM-005 | `instances/BM-005-ev-tou-peak-ca.json` | `BM-005-ev-tou-peak-ca.json` | EV TOU peak shaving |
| BM-006 | `instances/BM-006-pqc-bank-tls-inventory.json` | `BM-006-pqc-scan.json` | PQC bank-tls-inventory fixture scan |

CI runs regression smoke tests for BM-001, BM-003, and BM-006 on every PR (`tests/test_benchmark_regression.py`).

See [07-track-C-validation.md](../../roadmap/07-track-C-validation.md) for the full benchmark suite plan.
