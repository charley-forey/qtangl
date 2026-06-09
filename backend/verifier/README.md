# qtangl-verify

Standalone offline verifier for Qtangl signed migration reports.

```bash
pip install .
qtangl-verify report.json --api-base https://api.qtangl.com --json
```

Optional PQC algorithms: `pip install ".[pqc]"` (requires liboqs).
