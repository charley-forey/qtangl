# Qtangl Backend

This service turns a planning request into a ranked result with a plain-English
summary, metrics, and a visualization-friendly payload.

## Scope

- `POST /optimize` for the live pilot API
- Scheduling solver path implemented first
- OR-Tools CP-SAT baseline runs on every schedule request
- QAOA path via `qiskit-optimization` is attempted for tiny scheduling problems
- Honest fallback: if QAOA fails or does not beat the classical result, the API
  responds with the classical plan

## Install

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

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
- `QTANGL_RATE_LIMIT_PER_MINUTE` (optional)

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

## Qiskit learning / comparison workflow

1. Run the Max-Cut example in `examples/maxcut_qaoa_demo.py`
2. Run `examples/compare_schedule_solvers.py`
3. Compare the classical and QAOA outputs on the same 5-task schedule

## Classical vs QAOA notes

Add measured results here after running the comparison script locally:

| Problem | Classical result | QAOA result | Notes |
|--------|------------------|-------------|-------|
| 5-task precedence schedule | 0.017s, feasible 7-day plan, 0 violations | 6.886s, failed on simulator, memory/transpilation issues | Keep pilot classical-first; QAOA remains research-only for tiny problems |
