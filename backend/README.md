# Qtangl Backend

This service turns a planning request into a ranked result with a plain-English
summary, metrics, and a visualization-friendly payload.

## Scope

- `POST /optimize` for the live pilot API
- Scheduling solver path implemented first
- OR-Tools CP-SAT baseline runs on every schedule request
- QAOA path via `qiskit-optimization` is attempted only for tiny research-sized scheduling candidates
- Honest fallback: if QAOA fails or does not beat the classical result, the API
  responds with the classical plan

## Operational model

Qtangl's intended API shape is:

1. Upload the full scheduling job once
2. Run a global classical baseline on the full problem
3. Detect whether a tiny local repair window exists
4. Attempt QAOA only on a bounded micro-problem
5. Return one final plan with diagnostics

The current implementation introduces the orchestration seams for that flow, but it
does not yet extract real local repair windows from large schedules. Until that is
implemented, QAOA is only allowed to reuse the full job when the full job is already
small enough to be a safe research candidate.

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
- Fixture mode (`useFixture: true`) is production-safe and synchronous.
- Live scanning requires `QTANGL_PQC_ENABLE_LIVE_SCAN=true`, SSRF guards, and user authorization in the UI.
- Optional env: `QTANGL_PQC_DATA_DIR`, `QTANGL_PQC_SCAN_ALLOWLIST`, `QTANGL_PQC_ENABLE_OQS`, `QTANGL_OQS_DEMO_SERVER` (default `test.openquantumsafe.org`), `QTANGL_PQC_SCAN_TIMEOUT`, `QTANGL_PQC_MAX_ENDPOINTS`.
- Bundled fixtures: `backend/app/pqc/fixtures` (mirrored from `demos/pqc_migration/data`).

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

Add measured results here after running the comparison script locally:

| Problem | Classical result | QAOA result | Notes |
|--------|------------------|-------------|-------|
| 5-task precedence schedule | 0.017s, feasible 7-day plan, 0 violations | 6.886s, failed on simulator, memory/transpilation issues | Too large for safe simulator use in production |
| Tiny research schedule (3 tasks) | 0.017s, makespan 1 day, 0 violations | 4.3s, makespan 3 days, feasible but worse score | QAOA runs on tiny window; classical wins — see `benchmarks/results/BM-001-tiny-schedule.json` |
| Hospital fixture (10 runs) | ~classical wall time varies by scenario | Hybrid fixture replay | Avg objective gap ≈0; see `benchmarks/results/BM-003-hospital-summary.json` |
| PQC bank-tls-inventory fixture | — | — | ~0.2s scan; see `benchmarks/results/BM-006-pqc-scan.log` |
