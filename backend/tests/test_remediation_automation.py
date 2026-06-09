"""Tests for remediation automation connectors and tenant automate route."""

from __future__ import annotations

import os
import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.pqc.data import load_dataset
from app.pqc.pipeline import run_pqc_scan
from app.remediation.automation import open_hybrid_tls_pr, request_acme_reissue, venafi_policy_check
from app.remediation.service import simulate_post_migration_readiness
from app.store.scan_jobs import save_scan_bundle


class AutomationConnectorTest(unittest.TestCase):
    def test_acme_stub_without_directory_url(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("QTANGL_ACME_DIRECTORY_URL", None)
            result = request_acme_reissue(domain="example.com")
        self.assertEqual(result["status"], "stub")
        self.assertIn("QTANGL_ACME_DIRECTORY_URL", result["message"])

    def test_acme_ok_when_directory_reachable(self) -> None:
        directory = {"newOrder": "https://acme.example/new-order"}
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = directory
        mock_nonce = MagicMock()
        mock_nonce.headers = {"Replay-Nonce": "nonce-1"}
        mock_client = MagicMock()
        mock_client.get.return_value = mock_resp
        mock_client.head.return_value = mock_nonce
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)

        with patch.dict(os.environ, {"QTANGL_ACME_DIRECTORY_URL": "https://acme.example/directory"}):
            with patch("httpx.Client", return_value=mock_client):
                result = request_acme_reissue(domain="tls.example.com")
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["orderUrl"], "https://acme.example/new-order")

    def test_venafi_stub_with_pqc_heuristic(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("VENAFI_BASE_URL", None)
            os.environ.pop("VENAFI_API_KEY", None)
            ready = venafi_policy_check(policy_id="corp-pqc-hybrid-policy")
            plain = venafi_policy_check(policy_id="legacy-rsa-2048")
        self.assertEqual(ready["status"], "stub")
        self.assertTrue(ready["pqcReady"])
        self.assertFalse(plain["pqcReady"])

    def test_github_pr_stub_without_token(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("GITHUB_TOKEN", None)
            result = open_hybrid_tls_pr(repo="org/repo", branch="feat/tls", title="Hybrid TLS")
        self.assertEqual(result["status"], "stub")

    def test_simulate_uses_risk_severity_weights(self) -> None:
        report = {
            "readinessScore": 50.0,
            "remediationBacklog": [
                {"id": "r1", "severity": "critical"},
                {"id": "r2", "severity": "low"},
            ],
        }
        projection = simulate_post_migration_readiness(report=report, selected_remediation_ids=["r1", "r2"])
        self.assertEqual(projection["selectedCount"], 2)
        self.assertAlmostEqual(projection["delta"], 2.8 + 0.7, places=1)


class RemediationAutomateRouteTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.tenant_id = "sandbox"
        dataset = load_dataset()
        bundle = run_pqc_scan(dataset, scenario_id="bank-tls-inventory", use_fixture=True)
        save_scan_bundle(bundle.scan_id, bundle, tenant_id=self.tenant_id)
        self.scan_id = bundle.scan_id
        backlog = bundle.remediation_backlog
        if not backlog:
            self.skipTest("no remediation backlog in fixture")
        self.remediation_id = backlog[0].id

    def test_automate_requires_convert_tier(self) -> None:
        with patch("app.billing.entitlements.check_convert_feature") as mock_check:
            mock_check.return_value = {"code": "convert_tier_required", "tier": "monitor"}
            response = self.client.post(
                f"/tenant/scans/{self.scan_id}/remediation/automate",
                headers={"Authorization": "Bearer qtangl-demo-key"},
                json={"remediationId": self.remediation_id, "action": "acme"},
            )
        self.assertEqual(response.status_code, 402)

    def test_automate_acme_action(self) -> None:
        with patch("app.billing.entitlements.check_convert_feature", return_value=None):
            with patch(
                "app.remediation.automation.request_acme_reissue",
                return_value={"provider": "acme", "status": "ok", "orderUrl": "https://acme/order"},
            ):
                response = self.client.post(
                    f"/tenant/scans/{self.scan_id}/remediation/automate",
                    headers={"Authorization": "Bearer qtangl-demo-key"},
                    json={"remediationId": self.remediation_id, "action": "acme", "domain": "bank.example.com"},
                )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["result"]["status"], "ok")
        self.assertIn("orderUrl", payload["result"])

    def test_automate_venafi_action(self) -> None:
        with patch("app.billing.entitlements.check_convert_feature", return_value=None):
            with patch(
                "app.remediation.automation.venafi_policy_check",
                return_value={"provider": "venafi", "status": "stub", "pqcReady": False},
            ):
                response = self.client.post(
                    f"/tenant/scans/{self.scan_id}/remediation/automate",
                    headers={"Authorization": "Bearer qtangl-demo-key"},
                    json={"remediationId": self.remediation_id, "action": "venafi"},
                )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["result"]["provider"], "venafi")


if __name__ == "__main__":
    unittest.main()
