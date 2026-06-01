from __future__ import annotations

import unittest

from app.monitoring.alerts import evaluate_scan_alerts


class AlertsTenantSettingsTest(unittest.TestCase):
    def test_readiness_drop_respects_threshold(self) -> None:
        diff = {"readinessDelta": -6.0, "newQuantumVulnerableCount": 0}
        alerts = evaluate_scan_alerts(
            scan_diff=diff,
            readiness_score=50.0,
            readiness_band="at_risk",
            settings={"readinessDropThreshold": 5.0},
        )
        self.assertTrue(any(a["rule"] == "readiness_drop" for a in alerts))

        alerts_low = evaluate_scan_alerts(
            scan_diff={"readinessDelta": -3.0},
            readiness_score=50.0,
            readiness_band="at_risk",
            settings={"readinessDropThreshold": 5.0},
        )
        self.assertFalse(any(a["rule"] == "readiness_drop" for a in alerts_low))

    def test_new_qv_suppressed_when_disabled(self) -> None:
        diff = {"readinessDelta": 0, "newQuantumVulnerableCount": 2}
        alerts = evaluate_scan_alerts(
            scan_diff=diff,
            readiness_score=50.0,
            readiness_band="at_risk",
            settings={"alertOnNewQuantumVulnerable": False},
        )
        self.assertFalse(any(a["rule"] == "new_quantum_vulnerable" for a in alerts))


if __name__ == "__main__":
    unittest.main()
