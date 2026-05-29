# Airline OCC recovery demo — specification

## Persona

Operations Control Center (OCC) controller at a regional carrier. A maintenance hold removes one tail; three downstream legs need tail swap and crew rebid within ~90 minutes.

## Pipeline

1. **Routing repair** — reassign affected legs to spare tails.
2. **CP-SAT crew assignment** — multi-leg `x[crew, leg]` with FAR 117-eligible set and reserve fallback.
3. **Repair window** — BFS over crew adjacency (base, fleet rating, qualifications).
4. **Hybrid micro-solve** — bounded QUBO over crew×leg binaries; fixture QPU trace replay by default.

## Scoreboard

Manual vs Classical vs Hybrid: objective, recovery cost, on-time probability, FAR 117 compliance, distinct plan count.

## API

- `GET /airline/network`
- `GET /airline/scenarios`
- `POST /airline/recover/solve`
