# PQC migration / Q-Day readiness scanner — fully specified

## Persona and pain (0:00–0:30 of recording)

A CISO at a regional bank gets a board question: "How much of our TLS and signing stack is quantum-vulnerable before 2030?" Last quarter they spent six weeks on a spreadsheet inventory that missed JWKS signing keys and SSH bastion host keys. Contract risk from FedRAMP/CMMC customers is estimated at $8–15M; the PQC program budget line is $12M.

## What the demo shows

1. Enter `api.regionalbank.example` (or pick the bank scenario).
2. Click **Run Q-Day scan** — progress narrates CT enumeration, TLS handshakes, classification.
3. Scoreboard: manual spreadsheet (weeks, stale) vs Qtangl scan (minutes, prioritized backlog).
4. Mosca timeline: X + Y > Z for harvest-now-decrypt-later exposure.
5. **Post-quantum handshake proof**: ClientHello with X25519MLKEM768 hybrid group.
6. Export CycloneDX CBOM + PDF migration report.

## Honest value-add

Quantum is the **threat**, not the engine. Qtangl sells the defense: inventory, compliance crosswalk, and proof your stack can negotiate PQ TLS.

## Technical stack

- `backend/app/pqc/` — scanner, vulnerability engine, Mosca risk, reports
- Open Quantum Safe test server for live handshake when enabled
- NIST FIPS 203/204/205 mapping in `standards.json`
