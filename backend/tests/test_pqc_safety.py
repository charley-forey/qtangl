from __future__ import annotations

import unittest

from app.pqc.safety import ScanSafetyError, assert_scannable


class PqcSafetyTest(unittest.TestCase):
    def test_blocks_loopback(self) -> None:
        with self.assertRaises(ScanSafetyError):
            assert_scannable("127.0.0.1", port=443)

    def test_blocks_metadata_ip(self) -> None:
        with self.assertRaises(ScanSafetyError):
            assert_scannable("169.254.169.254", port=443)


if __name__ == "__main__":
    unittest.main()
