from __future__ import annotations

import unittest

from qtangl.verify import verify_report_offline


class VerifyHelperTest(unittest.TestCase):
    def test_offline_verify_rejects_empty_signature(self) -> None:
        result = verify_report_offline({"scanId": "x"}, {})
        self.assertFalse(result.get("valid"))
