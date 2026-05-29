from __future__ import annotations

import unittest

from app.airline.data import load_dataset, load_scenario, parse_uploaded_crew


class AirlineDataTest(unittest.TestCase):
    def test_load_dataset_has_crew_and_scenarios(self) -> None:
        dataset = load_dataset()
        self.assertGreaterEqual(len(dataset.crew), 40)
        self.assertGreaterEqual(len(dataset.scenarios), 3)

    def test_load_default_scenario(self) -> None:
        scenario = load_scenario("mx-hold-ord-0612")
        self.assertEqual(scenario.disruption.aircraft_id, "N812JB")

    def test_parse_uploaded_crew(self) -> None:
        crew = parse_uploaded_crew(
            "crew_id,qualifications,base,block_hours_week,last_duty_end,seniority_date\n"
            "crew-x,A320|ETOPS,KORD,30,2026-05-27T18:00:00,2020-01-01\n"
        )
        self.assertEqual(len(crew), 1)
        self.assertEqual(crew[0].base, "KORD")


if __name__ == "__main__":
    unittest.main()
