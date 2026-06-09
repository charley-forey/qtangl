# Code scan CI integration

Run cryptographic discovery in CI using the Qtangl code scan orchestrator (CryptoScan + CryptoDeps).

## GitHub Action

```yaml
- uses: qtangl/qtangl-scan@v1
  with:
    api-key: ${{ secrets.QTANGL_API_KEY }}
    mode: code
    repository: ${{ github.repository }}
```

## API (async)

```bash
curl -X POST https://api.qtangl.com/tenant/coverage/code-scan \
  -H "Authorization: Bearer $QTANGL_API_KEY" \
  -d '{"githubOwner":"org","githubRepo":"app","githubToken":"ghp_...","async":true}'
```

Poll: `GET /tenant/discovery/jobs/{jobId}`

## Policy gates

- `fail-on: vulnerable` — block merge on new quantum-vulnerable findings
- SARIF upload supported when CryptoScan is installed on runner

## Feature flag

Requires `discovery.codeScan` on tenant (default off).
