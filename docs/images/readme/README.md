# README screenshot assets

Product screenshots used in the root [README.md](../../README.md).

| File | Source | Shows |
|------|--------|-------|
| `assess-results.webp` | `web/public/marketing/assess-hndl-timeline.webp` | Assess — HNDL timeline and readiness score |
| `dashboard-monitor.webp` | `web/public/marketing/monitor-remediation-board.webp` | Monitor — remediation board and drift |
| `convert-verify.webp` | `web/public/marketing/convert-rescan-verify.webp` | Convert — re-scan verification proof |
| `signed-report.webp` | `web/public/marketing/assess-signed-pdf.webp` | Signed PDF report export |

## Refreshing assets

When marketing screenshots change in `web/public/marketing/`, re-copy:

```powershell
# From repo root (Windows)
Copy-Item web\public\marketing\assess-hndl-timeline.webp docs\images\readme\assess-results.webp
Copy-Item web\public\marketing\monitor-remediation-board.webp docs\images\readme\dashboard-monitor.webp
Copy-Item web\public\marketing\convert-rescan-verify.webp docs\images\readme\convert-verify.webp
Copy-Item web\public\marketing\assess-signed-pdf.webp docs\images\readme\signed-report.webp
```

```bash
# macOS/Linux
cp web/public/marketing/assess-hndl-timeline.webp docs/images/readme/assess-results.webp
cp web/public/marketing/monitor-remediation-board.webp docs/images/readme/dashboard-monitor.webp
cp web/public/marketing/convert-rescan-verify.webp docs/images/readme/convert-verify.webp
cp web/public/marketing/assess-signed-pdf.webp docs/images/readme/signed-report.webp
```

Live product URLs for manual captures: https://www.qtangl.com/assess · /dashboard · /verify · /trust
