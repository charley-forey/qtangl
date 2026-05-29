from __future__ import annotations

import unittest

from app.pqc.risk import assess_mosca


class PqcRiskTest(unittest.TestCase):
    def test_mosca_inequality_default_holds(self) -> None:
        mosca = assess_mosca(
            {"dataShelfLifeYears": 10, "migrationTimeYears": 5, "yearsToQDay": 12}
        )
        self.assertTrue(mosca.inequality_holds)


if __name__ == "__main__":
    unittest.main()
