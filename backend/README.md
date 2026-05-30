# Qtangl Backend

This service turns a planning request into a ranked result with a plain-English
summary, metrics, and a visualization-friendly payload.

## Scope

- `POST /optimize` for the live pilot API
- Problem types: **schedule**, **routing** (greedy VRP), **allocation** (CP-SAT staffing)
- Scheduling solver path with optional QAOA local repair window
- OR-Tools CP-SAT baseline runs on every schedule/allocation request
- QAOA path via `qiskit-optimization` is attempted only for tiny research-sized scheduling candidates
- Honest fallback: if QAOA fails or does not beat the classical result, the API
  responds with the classical plan
- **Persistence (D1):** set `DATABASE_URL` for Postgres-backed sessions, scan jobs, and reports; optional `REDIS_URL` for distributed rate limits and job queue notifications. Without these env vars, in-memory stores are used (dev/CI default).

## Operational model

Qtangl's intended API shape is:

1. Upload the full scheduling job once
2. Run a global classical baseline on the full problem
3. Detect whether a tiny local repair window exists
4. Attempt QAOA only on a bounded micro-problem
5. Return one final plan with diagnostics

The current implementation introduces the orchestration seams for that flow, but it
does not yet extract real local repair windows from large schedules. The generic
`/optimize` path now uses [`app/repair_window/scheduling.py`](app/repair_window/scheduling.py)
to extract a bounded critical-path neighborhood when QAOA is enabled.

## Install

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.lock -r requirements-dev.lock
```

For editable installs during development you may use `requirements.txt` directly, but **CI and releases use the lockfiles**.

## Run

```bash
uvicorn app.main:app --reload
```

The default pilot API key is `qtangl-demo-key`. Override it with
`QTANGL_API_KEY`.

## Railway staging

Recommended host for `backend/`: Railway.

Required Railway environment variables:

- `QTANGL_API_KEY`
- `QTANGL_RATE_LIMIT_PER_MINUTE` (optional, default `120` for the public demo)
- `QTANGL_ENABLE_QAOA=false` (recommended for Railway production)

PQC Q-Day scanner runtime notes:

- Endpoints live under `/pqc/*` (inventory, scenarios, scan, handshake proof, report export).
- **Production default:** fixture mode only (`useFixture: true`). Live scanning is **disabled** unless explicitly enabled.
- Bundled fixtures: `backend/app/pqc/fixtures` (mirrored from `demos/pqc_migration/data`).

### PQC live scan runbook (B1)

Enable live scanning only for authorized pilots or internal dogfood (Track G7).

**1. Railway / backend env**

| Variable | Production recommendation | Purpose |
|----------|---------------------------|---------|
| `QTANGL_PQC_ENABLE_LIVE_SCAN` | `false` (default) → `true` when needed | Master gate; API returns 403 if false and `useFixture=false` |
| `QTANGL_PQC_SCAN_ALLOWLIST` | Comma-separated hostnames | Restrict scans to customer-approved domains |
| `QTANGL_PQC_SCAN_TIMEOUT` | `8` (seconds) | Per-endpoint socket/HTTP timeout |
| `QTANGL_PQC_MAX_ENDPOINTS` | `24` | Cap CT + TLS + SSH + email probes per scan |
| `QTANGL_OQS_DEMO_SERVER` | `test.openquantumsafe.org` | Handshake proof default target |

Optional: `QTANGL_PQC_DATA_DIR`, `QTANGL_PQC_ENABLE_OQS`.

**2. Pre-flight checklist**

- [ ] Customer written authorization on file (UI checkbox is not legal consent alone)
- [ ] Target domain(s) added to `QTANGL_PQC_SCAN_ALLOWLIST` when using allowlist mode
- [ ] Fixture mode verified for demo recordings (`useFixture: true`)
- [ ] SSRF guards reviewed — see [roadmap/security/threat-model.md](../roadmap/security/threat-model.md) TH-001

**3. Verify locally**

```bash
cd backend
export QTANGL_PQC_ENABLE_LIVE_SCAN=true
export QTANGL_PQC_SCAN_ALLOWLIST=test.openquantumsafe.org
export QTANGL_PQC_RUN_LIVE_INTEGRATION=true
python -m pytest tests/test_pqc_scanner.py::PqcLiveScannerIntegrationTest -q
```

**4. API usage**

- Fixture (sync): `POST /pqc/scan` with `{"scenarioId":"bank-tls-inventory","useFixture":true}`
- Live (async): `{"useFixture":false,"target":"customer.example.com"}` → poll `GET /pqc/scan/{scanId}`

**5. Disable after pilot**

Set `QTANGL_PQC_ENABLE_LIVE_SCAN=false` and redeploy. No code change required.

Live scan call graph documented in [`app/pqc/scanner.py`](app/pqc/scanner.py) module docstring.

### PQC CBOM export (B2)

- Format: CycloneDX **1.6** with Qtangl profile **`qtangl-cbom-v1`** (`app/pqc/cbom.py`)
- Download: `GET /pqc/report/{scanId}?format=cbom` after scan completes
- Sample: [demos/pqc_migration/data/sample-cbom-bank-tls-inventory.json](../demos/pqc_migration/data/sample-cbom-bank-tls-inventory.json)
- Validate: `python -m pytest tests/test_pqc_cbom.py -q`
- Regenerate sample: `python scripts/generate_sample_cbom.py`

Hospital demo runtime notes:

- The hospital demo endpoints live under `/hospital/*`.
- Browser calls from `https://www.qtangl.com` require CORS; defaults allow qtangl.com, localhost, and `*.vercel.app`. Override with comma-separated `QTANGL_CORS_ORIGINS` if needed.
- Railway production does **not** need IBM Quantum credentials for the default demo mode.
- The production-safe mode is: live classical solve + cached QPU trace replay.
- The hospital fixture data is bundled into `backend/app/hospital/fixtures`, so the Docker image can serve the demo without mounting repo-root files.

Recommended local/research QAOA variables:

- `QTANGL_ENABLE_QAOA=true`
- `QTANGL_QAOA_MAX_BINARY_VARIABLES`
- `QTANGL_QAOA_MAX_HORIZON`
- `QTANGL_QAOA_MAX_OVERLAP_CONSTRAINTS`
- `QTANGL_QAOA_REPS`
- `QTANGL_QAOA_MAXITER`
- `QTANGL_QAOA_SHOTS`
- `QTANGL_QAOA_SIMULATOR_METHOD`

Optional IBM Runtime variables for offline trace refresh only:

- `QISKIT_IBM_TOKEN`
- `QISKIT_IBM_INSTANCE`

Recommended local auth for Railway CLI:

```powershell
$env:RAILWAY_TOKEN = "your-railway-token"
```

Secrets setup and rotation: [roadmap/security/secrets-runbook.md](../roadmap/security/secrets-runbook.md).

The container binds Railway's injected `PORT` automatically.

## Endpoints

- `GET /health`
- `POST /optimize`

## Canonical contract

The request accepts the documented Qtangl schema and normalizes type aliases
such as `scheduling -> schedule`.

The response returns:

- `summary`
- `solution`
- `metrics`
- `method`
- `details`
- `visualization`

The response diagnostics explain whether QAOA was:

- disabled by environment
- skipped because the candidate was too large
- bypassed because no suitable local repair window exists yet
- attempted but rejected in favor of the classical result
- successfully used on a bounded candidate

## Qiskit learning / comparison workflow

1. Run the Max-Cut example in `examples/maxcut_qaoa_demo.py`
2. Run `examples/compare_schedule_solvers.py`
3. Compare the classical and QAOA outputs on the same tiny research-sized schedule

## Classical vs QAOA notes

Measured on Python 3.13 with pinned lockfiles. Full JSON in `benchmarks/results/`. Regenerate with `python benchmarks/run_benchmark.py BM-00N --write`.

| ID | Problem | Classical result | QAOA / hybrid result | Notes |
|----|---------|------------------|----------------------|-------|
| BM-001 | Tiny research schedule (3 tasks) | 0.03s, makespan 1 day, 0 violations | 4.4s, makespan 3 days, feasible but worse | Classical wins — see `BM-001-tiny-schedule.json` |
| BM-002 | 5-task precedence schedule | 0.02s, makespan 3 days, 0 violations | Skipped (33 binary vars > limit 12) | Safe production guardrail — see `BM-002-five-task-precedence.json` |
| BM-003 | Hospital callout-cath-acls (10 runs) | ~0.02s classical wall time | 3 hybrid candidates, gap ≈0 | Fixture replay — see `BM-003-hospital-summary.json` |
| BM-004 | Airline mx-hold-ord-0612 | ~0.01s, objective ~1.14 | 2 hybrid plans, lower hybrid objective | Fixture replay — see `BM-004-airline-summary.json` |
| BM-005 | EV tou-peak-ca | Manual $620/day, 86 kW peak | Hybrid $26/day, 7 kW peak | Fixture replay — see `BM-005-ev-tou-peak-ca.json` |
| BM-006 | PQC bank-tls-inventory | — | ~0.001s scan, 7 assets | Production-safe fixture — see `BM-006-pqc-scan.json` |
