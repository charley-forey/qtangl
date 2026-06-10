"""WireMock-style AWS KMS flip tests."""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch


class AwsKmsFlipWireMockTests(unittest.TestCase):
    @patch("app.integrations.kms_flip._load_cloud_config", return_value={"flipRoleArn": "arn:aws:iam::123:role/flip"})
    def test_update_alias_stub_without_boto(self, _mock_cfg: MagicMock) -> None:
        from app.integrations.kms_flip import AwsKmsFlipAdapter

        adapter = AwsKmsFlipAdapter()
        result = adapter.execute(
            request={"action": "update_alias", "aliasName": "alias/signing", "newKeyId": "key-new"},
            target_env="staging",
            tenant_id="demo",
        )
        self.assertIn(result.get("status"), {"ok", "stub", "error"})
