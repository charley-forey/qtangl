"""Tests for batch monitor schedule creation."""

from __future__ import annotations

import unittest
from unittest.mock import patch

from app.monitoring.batch_schedules import create_batch_schedules


class BatchScheduleCreationTest(unittest.TestCase):
    tenant_id = "batch-sched-test"

    @patch("app.monitoring.batch_schedules.redis_enabled", return_value=True)
    @patch("app.monitoring.batch_schedules.scheduler_enabled", return_value=True)
    @patch("app.monitoring.batch_schedules.persistence_enabled", return_value=True)
    @patch("app.monitoring.batch_schedules.check_schedule_cadence", return_value=None)
    @patch("app.monitoring.batch_schedules.check_schedule_quota", return_value=None)
    @patch("app.monitoring.batch_schedules.create_schedule")
    @patch("app.monitoring.batch_schedules.list_schedules")
    def test_skips_existing_targets(
        self,
        list_schedules,
        create_schedule,
        *_mocks: object,
    ) -> None:
        list_schedules.return_value = [{"target": "qtangl.com"}]
        create_schedule.return_value = {"id": "sched-new", "target": "api.qtangl.com"}

        result = create_batch_schedules(
            tenant_id=self.tenant_id,
            targets=["qtangl.com", "api.qtangl.com"],
            skip_existing=True,
        )

        self.assertEqual(result["count"], 1)
        self.assertEqual(result["skipped"], ["qtangl.com"])
        create_schedule.assert_called_once()


if __name__ == "__main__":
    unittest.main()
