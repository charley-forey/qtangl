from __future__ import annotations

import unittest

from app.hospital.data import (
    load_dataset,
    load_default_callout,
    load_scenario,
    parse_uploaded_roster,
)


class HospitalDataLoadersTest(unittest.TestCase):
    def test_dataset_loads_expected_fixture_counts(self) -> None:
        dataset = load_dataset()

        self.assertEqual(len(dataset.roster), 180)
        self.assertEqual(len(dataset.shifts), 252)
        self.assertEqual(len(dataset.scenarios), 3)
        self.assertEqual(dataset.scenarios[0].id, "callout-cath-acls")
        self.assertGreater(len(dataset.qpu_trace.distribution), 0)
        self.assertIn("softWeights", dataset.penalty_weights)

    def test_default_callout_matches_primary_scenario(self) -> None:
        callout = load_default_callout()
        scenario = load_scenario("callout-cath-acls")

        self.assertEqual(callout.id, scenario.callout.id)
        self.assertEqual(callout.ward, "Cath Lab 2")
        self.assertIn("ACLS", callout.required_certifications)

    def test_parse_uploaded_roster_handles_template_shape(self) -> None:
        uploaded = parse_uploaded_roster(
            "\n".join(
                [
                    "nurse_id,certifications,ward,week_hours,last_shift_end,seniority_date",
                    "nurse-201,ACLS|PALS|BLS,Cath Lab 2,36,2026-05-25T18:30:00,2021-09-14",
                ]
            )
        )

        self.assertEqual(len(uploaded), 1)
        self.assertEqual(uploaded[0].id, "nurse-201")
        self.assertEqual(uploaded[0].home_ward, "Cath Lab 2")
        self.assertIn("ACLS", uploaded[0].certifications)


if __name__ == "__main__":
    unittest.main()
