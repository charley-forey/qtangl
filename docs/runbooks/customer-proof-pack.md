# Customer auditor proof pack

Mirror the public dogfood auditor bundle for **customer** tenants.

## v0 — Manual assembly (pilots)

Per close, deliver:

1. Verify URL: `https://www.qtangl.com/verify?scanId={latest}`
2. Content hash + transparency inclusion (if enabled)
3. CycloneDX CBOM export from scan actions
4. Board PDF: report URL with `?format=board`
5. Schedule statement: cadence + authorized domains list

## v1 — Script (metadata JSON)

```bash
QTANGL_API_KEY=qtangl_... \
python backend/scripts/generate_tenant_proof_pack.py \
  --tenant-id acme-pilot \
  --out acme-proof-pack.json
```

Output includes verify URLs, board PDF links, transparency root, and active schedule summary.

## v2 — Dashboard export (future)

One-click “Export proof pack” in Settings → Evidence (when evidence vault retention enabled).
