# Qtangl hospital re-staffing demo

## What it is

An auditable hospital staffing demo for the moment a specialty nurse calls out less than an hour before shift start.

The system runs a live CP-SAT solve, detects a local repair window, and replays a cached QPU trace to surface multiple feasible alternatives with a visible audit trail.

## Why it matters

- Manual staffing decisions often default to the safest but most expensive agency option.
- Classical solvers are fast, but typically return one best plan and hide near-equivalent alternates.
- Staffing offices need safe alternatives with fatigue, fairness, certification, and cost trade-offs still visible.

## What the demo shows

- Cath-lab ACLS call-out scenario
- Honest scoreboard: Manual vs Classical vs Hybrid
- Audit drawer: QUBO snapshot, binding constraints, cost breakdown, cached QPU trace, reproducibility
- ROI calculator and anonymized roster CSV upload path

## Proof points

- 420-bed regional hospital fixture set grounded in public PBJ-shaped staffing distributions
- 50-run benchmark harness written to `benchmarks/hospital_results.csv`
- Cached hardware-style trace written to `demos/hospital_restaffing/data/qpu_trace.json`

## Links

- Demo: `/demo/hospital`
- Methodology: `/demo/hospital/methodology`
- Access: `/access?source=leave-behind`
