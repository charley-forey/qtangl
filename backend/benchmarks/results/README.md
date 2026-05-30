# Benchmark results

Committed outputs from Phase 0 baseline runs. Regenerate after solver or dependency changes.

## How to regenerate

From repo root:

```bash
cd backend
pip install -r requirements.lock -r requirements-dev.lock

# BM-001: tiny schedule classical vs QAOA
python examples/compare_schedule_solvers.py > benchmarks/results/BM-001-tiny-schedule.json

# BM-003: hospital fixture harness (summary)
python -c "from benchmarks.hospital_harness import run_harness; import json; rows=run_harness(10); print(json.dumps({'sampleCount':len(rows),'rows':rows[:3],'aggregates':{'avgObjectiveGap':sum(float(r['objective_gap']) for r in rows)/len(rows)}}, indent=2))" > benchmarks/results/BM-003-hospital-summary.json

# BM-006: PQC fixture scan
python benchmarks/pqc_harness.py 2>&1 | tee benchmarks/results/BM-006-pqc-scan.log
```

Full harness CSVs (optional, slower) write to repo-root `benchmarks/` via each harness `main()`.

## Files

| ID | File | Description |
|----|------|-------------|
| BM-001 | `BM-001-tiny-schedule.json` | 3-task schedule: classical vs QAOA |
| BM-003 | `BM-003-hospital-summary.json` | 10-run hospital fixture aggregate |
| BM-006 | `BM-006-pqc-scan.log` | PQC bank-tls-inventory fixture scan |

See [07-track-C-validation.md](../../roadmap/07-track-C-validation.md) for the full benchmark suite plan.
