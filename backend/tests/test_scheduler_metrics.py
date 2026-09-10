from __future__ import annotations

import runpy
from unittest.mock import MagicMock, patch

import pytest

from app.monitoring import scheduler_state


@pytest.fixture(autouse=True)
def isolated_state(monkeypatch):
    monkeypatch.delenv("QTANGL_SCHEDULER_STATE_FILE", raising=False)
    monkeypatch.setattr(scheduler_state, "_STATE", {
        "last_tick_at": None, "last_enqueued_count": 0, "total_enqueued": 0,
    })


def test_record_tick_updates_local_metrics_without_redis():
    with patch("app.db.config.redis_enabled", return_value=False), patch.object(scheduler_state, "redis_enabled", return_value=False):
        scheduler_state.record_scheduler_tick(enqueued=3)
        metrics = scheduler_state.scheduler_metrics()
    assert metrics["lastEnqueuedCount"] == 3
    assert metrics["totalEnqueued"] == 3
    assert metrics["lastTickAt"] is not None


def test_independent_worker_and_api_instances_share_redis_state():
    shared = {}
    client = MagicMock()
    pipeline = client.pipeline.return_value.__enter__.return_value
    pipeline.hset.side_effect = lambda key, mapping: shared.update(mapping)
    def increment(key, field, count):
        shared[field] = shared.get(field, 0) + count
    pipeline.hincrby.side_effect = increment
    pipeline.execute.side_effect = lambda: [1, shared["total_enqueued"]]
    client.hgetall.side_effect = lambda key: {k: str(v) for k, v in shared.items()}
    with patch("app.db.config.redis_enabled", return_value=True), patch("app.queue.redis_queue._get_client", return_value=client):
        worker = runpy.run_path(scheduler_state.__file__)
        api = runpy.run_path(scheduler_state.__file__)
        worker["record_scheduler_tick"](enqueued=3)
        restarted_worker = runpy.run_path(scheduler_state.__file__)
        restarted_worker["record_scheduler_tick"](enqueued=2)
        assert api["_STATE"]["last_tick_at"] is None
        metrics = api["scheduler_metrics"]()
    assert metrics["lastTickAt"] == shared["last_tick_at"]
    assert metrics["lastEnqueuedCount"] == 2
    assert metrics["totalEnqueued"] == 5
    client.hgetall.assert_called_with("qtangl:scheduler:state")


@pytest.mark.parametrize("raw", [
    {},
    {"last_tick_at": "nan", "last_enqueued_count": "0", "total_enqueued": "0"},
    {"last_tick_at": "broken", "last_enqueued_count": "0", "total_enqueued": "0"},
    {"last_tick_at": "1000", "last_enqueued_count": "-1", "total_enqueued": "0"},
])
def test_missing_or_invalid_shared_state_never_uses_local_tick(raw):
    scheduler_state._STATE.update(last_tick_at=1000, last_enqueued_count=4, total_enqueued=9)
    client = MagicMock()
    client.hgetall.return_value = raw
    with patch("app.db.config.redis_enabled", return_value=True), patch.object(scheduler_state, "_get_client", return_value=client):
        metrics = scheduler_state.scheduler_metrics()
    assert metrics["lastTickAt"] is None
    assert metrics["lastEnqueuedCount"] is None
    assert metrics["totalEnqueued"] is None


def test_redis_outage_does_not_claim_local_heartbeat():
    client = MagicMock()
    client.pipeline.side_effect = ConnectionError("Redis unavailable")
    client.hgetall.side_effect = ConnectionError("Redis unavailable")
    with patch("app.db.config.redis_enabled", return_value=True), patch.object(scheduler_state, "redis_enabled", return_value=True), patch.object(scheduler_state, "_get_client", return_value=client):
        scheduler_state.record_scheduler_tick(enqueued=7)
        metrics = scheduler_state.scheduler_metrics()
    assert metrics["lastTickAt"] is None
    assert metrics["lastEnqueuedCount"] is None


@pytest.mark.parametrize("tick,enabled,expected", [
    (995, True, "ready"), (870, True, "degraded"),
    (None, True, "degraded"), (float("nan"), True, "degraded"),
    (1001, True, "degraded"), (None, False, "ready"),
])
def test_readiness_requires_recent_tick_only_when_scheduler_enabled(tick, enabled, expected):
    from app.main import health_ready
    metrics = {"schedulerEnabled": enabled, "lastTickAt": tick, "intervalSec": 60}
    with patch("app.monitoring.scheduler_state.scheduler_metrics", return_value=metrics), patch("app.main.persistence_enabled", return_value=False), patch("app.main.redis_enabled", return_value=False), patch("app.security.secrets.secrets_key_status", return_value={}), patch("time.time", return_value=1000):
        result = health_ready()
    assert result["status"] == expected
    assert result["schedulerStale"] is (expected == "degraded")


def test_shared_heartbeat_with_real_redis(monkeypatch):
    """Opt-in CI integration; never connects using ambient application credentials."""
    import os
    import uuid

    url = os.environ.get("QTANGL_TEST_REDIS_URL")
    if not url:
        pytest.skip("QTANGL_TEST_REDIS_URL is required for the Redis integration check")
    import redis

    monkeypatch.setenv("REDIS_URL", url)
    monkeypatch.delenv("QTANGL_REDIS_URL", raising=False)
    key = f"qtangl:test:scheduler:{uuid.uuid4().hex}"
    worker_client = redis.from_url(url, decode_responses=True, socket_timeout=5, socket_connect_timeout=5)
    api_client = redis.from_url(url, decode_responses=True, socket_timeout=5, socket_connect_timeout=5)

    def load_instance(client):
        with patch("app.queue.redis_queue._get_client", return_value=client):
            instance = runpy.run_path(scheduler_state.__file__)
        instance["scheduler_metrics"].__globals__["_REDIS_KEY"] = key
        return instance

    try:
        worker = load_instance(worker_client)
        api = load_instance(api_client)
        assert api["scheduler_metrics"]()["lastTickAt"] is None
        worker["record_scheduler_tick"](enqueued=3)
        restarted_worker = load_instance(worker_client)
        restarted_worker["record_scheduler_tick"](enqueued=2)
        assert api["_STATE"]["last_tick_at"] is None
        metrics = api["scheduler_metrics"]()
        assert metrics["lastTickAt"] is not None
        assert metrics["lastEnqueuedCount"] == 2
        assert metrics["totalEnqueued"] == 5
    finally:
        try:
            worker_client.delete(key)
        finally:
            worker_client.close()
            api_client.close()
