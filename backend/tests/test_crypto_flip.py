"""Crypto flip control plane tests."""

from __future__ import annotations

import os
import unittest

os.environ["CRYPTO_FLIP_ENABLED"] = "true"
os.environ["PERSISTENCE_ENABLED"] = "false"


class CryptoFlipPolicyTests(unittest.TestCase):
    def test_evaluate_staging_auto_approve(self) -> None:
        from app.remediation.flip_policy import evaluate_flip_policy

        policy = evaluate_flip_policy(
            tenant_id="demo",
            flip_surface="overlay",
            provider="github",
            target_env="staging",
            submitter="user-a",
        )
        self.assertTrue(policy.get("allowed"))
        self.assertFalse(policy.get("requiresApproval"))

    def test_prod_requires_approval(self) -> None:
        from app.remediation.flip_policy import evaluate_flip_policy

        policy = evaluate_flip_policy(
            tenant_id="demo",
            flip_surface="clm",
            provider="venafi",
            target_env="prod",
            submitter="user-a",
        )
        self.assertTrue(policy.get("requiresApproval"))

    def test_kms_two_person_rule_flag(self) -> None:
        from app.remediation.flip_policy import evaluate_flip_policy

        policy = evaluate_flip_policy(
            tenant_id="demo",
            flip_surface="kms",
            provider="kms-aws",
            target_env="prod",
            submitter="user-a",
        )
        self.assertTrue(policy.get("twoPersonRule"))


class CryptoFlipDryRunTests(unittest.TestCase):
    def test_overlay_dry_run(self) -> None:
        from unittest.mock import patch

        from app.remediation.flip import dry_run

        with (
            patch("app.remediation.flip.crypto_flip_enabled", return_value=True),
            patch("app.remediation.flip.check_crypto_flip_feature", return_value=None),
        ):
            result = dry_run(
                tenant_id="sandbox",
                program_item_id="prog-1",
                flip_surface="overlay",
                provider="github",
                target_env="staging",
                request={"repo": "org/repo"},
            )
        self.assertTrue(result.get("ok"))
        self.assertIn("dryRunResult", result)


class ClmFlipAdapterTests(unittest.TestCase):
    def test_venafi_stub_request(self) -> None:
        from app.integrations.clm_flip import VenafiFlipAdapter

        adapter = VenafiFlipAdapter()
        result = adapter.request_certificate(config={}, request={"domain": "test.example.com"})
        self.assertIn(result.get("status"), {"stub", "error", "pending"})

    def test_digicert_stub_order(self) -> None:
        from app.integrations.clm_flip import DigiCertFlipAdapter

        adapter = DigiCertFlipAdapter()
        result = adapter.order_certificate(config={}, request={"commonName": "test.example.com"})
        self.assertEqual(result.get("status"), "stub")


class KmsFlipAdapterTests(unittest.TestCase):
    def test_aws_dry_run(self) -> None:
        from app.integrations.kms_flip import AwsKmsFlipAdapter

        adapter = AwsKmsFlipAdapter()
        result = adapter.dry_run(request={"aliasName": "alias/qtangl-signing"}, target_env="staging")
        self.assertEqual(result.get("status"), "dry_run")

    def test_no_pem_in_result(self) -> None:
        import re

        from app.integrations.kms_flip import AwsKmsFlipAdapter

        adapter = AwsKmsFlipAdapter()
        result = adapter.execute(request={"action": "update_alias", "aliasName": "test"}, target_env="staging", tenant_id="demo")
        blob = str(result)
        self.assertIsNone(re.search(r"BEGIN (RSA |EC )?PRIVATE KEY", blob))


class KmsPullTests(unittest.TestCase):
    def test_pull_aws_without_boto(self) -> None:
        from app.integrations.kms_pull import pull_aws_kms

        result = pull_aws_kms()
        self.assertIn(result.get("status"), {"error", "ok", "stub"})


if __name__ == "__main__":
    unittest.main()
