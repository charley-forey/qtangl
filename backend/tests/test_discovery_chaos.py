"""Chaos-style resilience tests for discovery queues."""

from __future__ import annotations

from unittest.mock import patch

from app.queue.redis_queue import total_discovery_queue_depth


def test_total_discovery_queue_depth_zero_without_redis():
    with patch("app.queue.redis_queue._get_client", return_value=None):
        assert total_discovery_queue_depth() == 0
