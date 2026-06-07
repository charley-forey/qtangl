"""CBOM drift alert evaluation tests."""

from __future__ import annotations

from app.monitoring.alerts import evaluate_cbom_alerts


def test_evaluate_cbom_alerts_added():
    alerts = evaluate_cbom_alerts({"available": True, "addedCount": 3, "changedCount": 0, "removedCount": 0})
    assert any(a["rule"] == "cbom_assets_added" for a in alerts)


def test_evaluate_cbom_alerts_unavailable():
    assert evaluate_cbom_alerts({"available": False}) == []
