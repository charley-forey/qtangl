# EV fleet depot charging + routing — demo spec

Rank 3 use case: last-mile depot with TOU tariffs, VRP routing, and charger-queue hybrid staggering.

## Pipeline

1. VRP route assignment (greedy)
2. CP-SAT charger queue + TOU cost
3. Repair window (peak overlap vans)
4. Hybrid QUBO stagger (fixture QPU replay default)

## Scoreboard

- Manual: plug on return (naive peak draw)
- Classical: TOU-aware CP-SAT
- Hybrid: staggered peak micro-window

## API

Prefix `/ev-fleet/*` — see docs at `/docs/guides/ev-fleet-demo`.
