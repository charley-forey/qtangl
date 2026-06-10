# Crypto flip chaos and soak

## Load benchmark

```bash
cd backend
CRYPTO_FLIP_ENABLED=true python benchmarks/flip_load.py
```

Target: ≥1k dry-runs/min on staging (in-memory policy path).

## Chaos scenarios

| Scenario | Expected behavior |
|----------|-------------------|
| Venafi API timeout during execute | Job → `failed`; program item stays `in_progress`; retry available |
| Provider 503 on poll | Job stays `running`; poll retries on next GET |
| Cancel mid-flight | Job → `cancelled`; no duplicate external ref |

## Staging soak (2 weeks)

- Daily CLM dry-runs per pilot tenant
- Monitor `qtangl_flip_provider_errors_total` and DLQ depth
- No prod KMS flip without pilot sign-off
