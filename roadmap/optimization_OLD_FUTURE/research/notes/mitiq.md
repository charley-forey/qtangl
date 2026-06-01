# mitiq — research note

**Repo:** [unitaryfund/mitiq](https://github.com/unitaryfund/mitiq)  
**Track:** J2 error mitigation (research only)  
**Status:** Documented; not wired to production API

## Why it matters

Mitiq documents zero-noise extrapolation and probabilistic error cancellation — relevant if Qtangl moves from Aer simulator to real IBM Runtime (A5).

## Integration hypothesis

- Apply mitiq only on captured QPU traces in `backend/app/hospital/fixtures/qpu_trace.json`
- Measure top-candidate weight correlation vs unmitigated trace (C4 tolerance)

## Next experiment

Offline notebook on one hospital micro-window trace before any live QPU spend.

## Decision

**Defer** until A5 produces a fresh live trace worth mitigating.
