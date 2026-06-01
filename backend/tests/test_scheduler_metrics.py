from __future__ import annotations

import unittest

from app.monitoring.scheduler_state import record_scheduler_tick, scheduler_metrics


class SchedulerMetricsTest(unittest.TestCase):
    def test_record_tick_updates_metrics(self) -> None:
        record_scheduler_tick(enqueued=3)
        metrics = scheduler_metrics()
        self.assertTrue(metrics["schedulerEnabled"] is False or isinstance(metrics["schedulerEnabled"], bool))
        self.assertEqual(metrics["lastEnqueuedCount"], 3)
        self.assertGreaterEqual(metrics["totalEnqueued"], 3)


if __name__ == "__main__":
    unittest.main()
