# openqaoa — research note

**Repo:** [entropicalabs/openqaoa](https://github.com/entropicalabs/openqaoa)  
**Track:** J5 library mining  
**Status:** Evaluated for warm-start patterns (J2)

## Why it matters

OpenQAOA provides QAOA circuit construction and warm-start hooks that map cleanly to Qtangl's bounded repair-window QUBOs.

## Integration hypothesis

- Warm-start QAOA initial parameters from CP-SAT assignment bitmask
- Compare `distinctFeasiblePlans` vs cold-start on BM-003 hospital window

## Next experiment

Run `python -m research.eval_harness --instance BM-001 --solver qaoa-aer` with warm-start branch in `backend/app/solvers/qaoa.py` (J2-001).

## Decision

**Adopt for research** — not production default until C3 reproducibility and C2 success metric pass on warm-start path.
