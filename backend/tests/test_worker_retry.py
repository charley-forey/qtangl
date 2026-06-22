from __future__ import annotations

import os
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from app.db.engine import init_db
from app.pqc.safety import ScanSafetyError
from app.store.scan_jobs import create_job, fail_job, get_job, retry_pqc_scan_job
from app.worker import execute_pqc_scan_job, process_next_job


class RetryPqcScanJobTest(unittest.TestCase):
    def setUp(self) -> None:
        self._tmpdir = tempfile.TemporaryDirectory()
        self._db_path = os.path.join(self._tmpdir.name, "retry.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{self._db_path}"
        os.environ["QTANGL_DB_AUTO_MIGRATE"] = "true"
        self._reset_engine()
        init_db()

    def tearDown(self) -> None:
        self._reset_engine()
        os.environ.pop("DATABASE_URL", None)
        self._tmpdir.cleanup()

    def _reset_engine(self) -> None:
        import app.db.engine as engine_module

        if engine_module._engine is not None:
            engine_module._engine.dispose()
        engine_module._engine = None
        engine_module._SessionLocal = None

    @patch("app.store.scan_jobs.enqueue_job")
    @patch("app.store.scan_jobs.store_job_payload")
    @patch("app.store.scan_jobs.time.sleep")
    def test_retry_requeues_with_attempt_two(self, sleep_mock, store_payload, enqueue_mock) -> None:
        scan_id = create_job(
            tenant_id="tenant-a",
            payload={"scenarioId": "bank-tls-inventory", "tenantId": "tenant-a", "attempt": 1},
        )
        payload = {"scenarioId": "bank-tls-inventory", "tenantId": "tenant-a", "attempt": 1}

        ok = retry_pqc_scan_job(
            scan_id=scan_id,
            tenant_id="tenant-a",
            payload=payload,
            error="transient network error",
        )

        self.assertTrue(ok)
        sleep_mock.assert_called_once_with(1)
        store_payload.assert_called_once()
        stored = store_payload.call_args[0][1]
        self.assertEqual(stored["attempt"], 2)
        self.assertEqual(stored["lastError"], "transient network error")
        enqueue_mock.assert_called_once_with("pqc_scan", scan_id)
        job = get_job(scan_id, tenant_id="tenant-a")
        assert job is not None
        self.assertEqual(job.status, "running")

    @patch("app.store.scan_jobs.enqueue_job")
    @patch("app.store.scan_jobs.store_job_payload")
    @patch("app.store.scan_jobs.time.sleep")
    def test_retry_once_only(self, sleep_mock, store_payload, enqueue_mock) -> None:
        scan_id = create_job(
            tenant_id="tenant-a",
            payload={"scenarioId": "bank-tls-inventory", "tenantId": "tenant-a", "attempt": 2},
        )
        payload = {"scenarioId": "bank-tls-inventory", "tenantId": "tenant-a", "attempt": 2}

        ok = retry_pqc_scan_job(
            scan_id=scan_id,
            tenant_id="tenant-a",
            payload=payload,
            error="still failing",
        )

        self.assertFalse(ok)
        sleep_mock.assert_not_called()
        store_payload.assert_not_called()
        enqueue_mock.assert_not_called()


class ExecutePqcScanJobTest(unittest.TestCase):
    @patch("app.worker._run_scan_once")
    def test_scan_safety_error_propagates(self, run_once) -> None:
        run_once.side_effect = ScanSafetyError("blocked target")
        with self.assertRaises(ScanSafetyError):
            execute_pqc_scan_job(
                "scan-1",
                {"scenarioId": "bank-tls-inventory", "tenantId": "sandbox"},
                tenant_id="sandbox",
            )


class ProcessNextJobRetryTest(unittest.TestCase):
    @patch("app.worker.process_discovery_job", return_value=False)
    @patch("app.worker.fail_job")
    @patch("app.worker.retry_pqc_scan_job", return_value=True)
    @patch("app.worker.execute_pqc_scan_job")
    @patch("app.worker.get_job")
    @patch("app.worker.load_job_payload")
    @patch("app.worker.dequeue_blocking")
    def test_transient_failure_requeues(
        self,
        dequeue_mock,
        load_payload_mock,
        get_job_mock,
        execute_mock,
        retry_mock,
        fail_mock,
        _discovery_mock,
    ) -> None:
        dequeue_mock.return_value = "scan-retry-1"
        load_payload_mock.return_value = {"tenantId": "tenant-a", "attempt": 1}
        job = MagicMock()
        job.status = "running"
        get_job_mock.return_value = job
        execute_mock.side_effect = RuntimeError("timeout")

        handled = process_next_job()

        self.assertTrue(handled)
        retry_mock.assert_called_once()
        fail_mock.assert_not_called()

    @patch("app.worker.process_discovery_job", return_value=False)
    @patch("app.worker.fail_job")
    @patch("app.worker.retry_pqc_scan_job", return_value=False)
    @patch("app.worker.execute_pqc_scan_job")
    @patch("app.worker.get_job")
    @patch("app.worker.load_job_payload")
    @patch("app.worker.dequeue_blocking")
    def test_permanent_failure_marks_error(
        self,
        dequeue_mock,
        load_payload_mock,
        get_job_mock,
        execute_mock,
        retry_mock,
        fail_mock,
        _discovery_mock,
    ) -> None:
        dequeue_mock.return_value = "scan-fail-1"
        load_payload_mock.return_value = {"tenantId": "tenant-a", "attempt": 2}
        job = MagicMock()
        job.status = "running"
        get_job_mock.return_value = job
        execute_mock.side_effect = RuntimeError("permanent")

        process_next_job()

        retry_mock.assert_called_once()
        fail_mock.assert_called_once()

    @patch("app.worker.process_discovery_job", return_value=False)
    @patch("app.worker.fail_job")
    @patch("app.worker.retry_pqc_scan_job")
    @patch("app.worker.execute_pqc_scan_job")
    @patch("app.worker.get_job")
    @patch("app.worker.load_job_payload")
    @patch("app.worker.dequeue_blocking")
    def test_scan_safety_error_no_retry(
        self,
        dequeue_mock,
        load_payload_mock,
        get_job_mock,
        execute_mock,
        retry_mock,
        fail_mock,
        _discovery_mock,
    ) -> None:
        dequeue_mock.return_value = "scan-safe-1"
        load_payload_mock.return_value = {"tenantId": "tenant-a"}
        job = MagicMock()
        job.status = "running"
        get_job_mock.return_value = job
        execute_mock.side_effect = ScanSafetyError("ssrf blocked")

        process_next_job()

        retry_mock.assert_not_called()
        fail_mock.assert_called_once_with("scan-safe-1", "ssrf blocked", tenant_id="tenant-a")
