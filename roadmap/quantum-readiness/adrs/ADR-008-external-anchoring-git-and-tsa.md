# ADR-008: External anchoring (Git witness + RFC 3161 TSA)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-08 |
| **Epic** | K16 |

## Decision

Publish transparency log roots to a **public Git repository** and obtain **RFC 3161 timestamps** from a public TSA. Local file witness remains as fallback. Merkle root is anchored alongside linear chain root.

## Threat model

- Qtangl cannot silently rewrite history without detection against Git + TSA witnesses.
- Git token is contents-only, single-repo, rotatable.

## Alternatives rejected

Blockchain anchoring (ADR-006): over-engineered at current scale.
