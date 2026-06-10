from unittest.mock import patch

from app.monitoring.drift_snapshots import record_drift_snapshot


def test_snapshot_write_failure_returns_none():
    with patch("app.monitoring.drift_snapshots.db_session", side_effect=RuntimeError("db down")):
        result = record_drift_snapshot(
            tenant_id="tenant-test",
            source_type="external",
            scope_key="example.com",
            payload={"findingIds": []},
        )
    assert result is None
