# Staging Monitor smoke test

1. Set `DATABASE_URL`, `REDIS_URL`, `QTANGL_ENABLE_SCHEDULER=true`, `QTANGL_INLINE_JOBS=false`.
2. Start API and `python -m app.worker`.
3. `POST /tenant/schedules` with target + notify email.
4. Wait one scheduler interval; confirm scan completes.
5. Configure webhook URL; confirm v2 payload or DLQ on failure.
6. Replay DLQ from dashboard Integration settings.
7. Export PDF; confirm remediation `workflowStatus` in metadata.
