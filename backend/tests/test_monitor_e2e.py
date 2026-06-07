"""E2E monitor flow — delegates to scheduler harness (see test_scheduler.py)."""

from __future__ import annotations

from tests.test_scheduler import ScheduledScanWorkerTest


def test_monitor_scheduled_enqueue_e2e() -> None:
    case = ScheduledScanWorkerTest()
    case.setUp()
    try:
        case.test_enqueue_due_scans_creates_job_and_advances_next_run()
    finally:
        case.tearDown()
