from __future__ import annotations

import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from app.db.engine import init_db
from app.monitoring.service import (
    create_schedule,
    due_schedules,
    enqueue_due_scans,
    list_schedules,
    scheduler_enabled,
)
from app.store.scan_jobs import get_job_payload
from app.tenants.service import create_tenant


class ScheduledScanWorkerTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "scheduler.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        os.environ["QTANGL_ENABLE_SCHEDULER"] = "true"
        os.environ["QTANGL_INLINE_JOBS"] = "true"
        self._reset_engine()
        init_db()
        create_tenant(name="Monitor Co", tenant_id="tenant-monitor")
        self.tenant_id = "tenant-monitor"

    def tearDown(self) -> None:
        self._reset_engine()
        for key in ("DATABASE_URL", "QTANGL_ENABLE_SCHEDULER", "QTANGL_INLINE_JOBS", "QTANGL_DB_AUTO_MIGRATE"):
            os.environ.pop(key, None)
        self._tmpdir.cleanup()

    def _reset_engine(self) -> None:
        import app.db.engine as engine_module
        import app.pqc.sessions as pqc_sessions

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None
        pqc_sessions._store = None

    def test_scheduler_enabled_when_env_set(self) -> None:
        self.assertTrue(scheduler_enabled())

    def test_create_and_list_schedule(self) -> None:
        schedule = create_schedule(
            tenant_id=self.tenant_id,
            scenario_id="bank-tls-inventory",
            target="api.example.com",
            cadence_hours=168,
            notify_email="ciso@example.com",
        )
        self.assertTrue(schedule["id"].startswith("sched-"))
        listed = list_schedules(tenant_id=self.tenant_id)
        self.assertEqual(len(listed), 1)
        self.assertEqual(listed[0]["target"], "api.example.com")

    def test_enqueue_due_scans_creates_job_and_advances_next_run(self) -> None:
        schedule = create_schedule(
            tenant_id=self.tenant_id,
            scenario_id="bank-tls-inventory",
            target="api.example.com",
            cadence_hours=24,
            notify_email="ciso@example.com",
        )
        due = due_schedules()
        self.assertEqual(len(due), 1)

        enqueued = enqueue_due_scans()
        self.assertEqual(enqueued, 1)

        listed = list_schedules(tenant_id=self.tenant_id)
        last_scan_id = listed[0]["lastRunScanId"]
        self.assertIsNotNone(last_scan_id)

        payload = get_job_payload(last_scan_id, tenant_id=self.tenant_id)
        self.assertIsNotNone(payload)
        assert payload is not None
        self.assertEqual(payload["scheduleId"], schedule["id"])
        self.assertEqual(payload["tenantId"], self.tenant_id)
        self.assertEqual(payload["notifyEmail"], "ciso@example.com")

        due_after = due_schedules()
        self.assertEqual(len(due_after), 0)

    def test_enqueue_skipped_when_scheduler_disabled(self) -> None:
        create_schedule(
            tenant_id=self.tenant_id,
            scenario_id="bank-tls-inventory",
            target="api.example.com",
            cadence_hours=24,
        )
        with patch.dict(os.environ, {"QTANGL_ENABLE_SCHEDULER": "false"}):
            self.assertFalse(scheduler_enabled())
            self.assertEqual(enqueue_due_scans(), 0)

    def test_due_schedules_respects_next_run_at(self) -> None:
        from app.db.engine import db_session
        from app.db.models import ScheduledScan as ScheduledScanRow

        schedule = create_schedule(
            tenant_id=self.tenant_id,
            scenario_id="bank-tls-inventory",
            target="future.example.com",
            cadence_hours=24,
        )
        future = datetime.now(timezone.utc) + timedelta(days=7)
        with db_session() as session:
            row = session.get(ScheduledScanRow, schedule["id"])
            assert row is not None
            row.next_run_at = future

        self.assertEqual(len(due_schedules()), 0)


if __name__ == "__main__":
    unittest.main()
