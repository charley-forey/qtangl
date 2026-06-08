# ADR-009: Readiness Index data product

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-08 |
| **Epic** | K14 |

## Decision

Build a consented, k-anonymized Readiness Index (cohort minimum 10). No PII in aggregates. Opt-in via tenant settings. Synthetic benchmarks removed when real cohorts exist.

## Governance

Per [21-data-and-threat-intelligence.md](../21-data-and-threat-intelligence.md): customer owns raw data; aggregates only; no re-identification.
