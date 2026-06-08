# Transparency witness onboarding

Third parties can independently observe and co-sign the Qtangl transparency log.

## Steps

1. Poll `GET /pqc/transparency/root` for `{merkleRoot, seq}`.
2. Verify append-only via `GET /pqc/transparency/consistency?from_seq=A&to_seq=B`.
3. Co-sign observed root and submit `POST /pqc/transparency/witness`.

Reference script: `backend/scripts/qtangl_witness.py`

## Listed witnesses

Active witnesses appear on the trust page via `GET /pqc/transparency/witnesses`.
