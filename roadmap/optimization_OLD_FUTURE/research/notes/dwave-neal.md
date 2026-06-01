# dwave-neal — research note

**Package:** `dwave-neal` (simulated annealing sampler)  
**Track:** J3 quantum annealing path  
**Status:** Candidate for eval harness comparison

## Why it matters

Neal provides a fast classical annealer for QUBO instances without simulator fragility — useful baseline for "quantum-inspired sufficient?" question.

## Integration hypothesis

- Route repair-window QUBO to neal with fixed seed
- Compare alternate diversity and wall time vs QAOA Aer on BM-003

## Next experiment

Extend `backend/research/eval_harness.py` with `dwave-neal` solver adapter (J3-001).

## Decision

**Pending** — integrate after J1 harness baseline committed.
