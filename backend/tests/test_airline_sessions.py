from __future__ import annotations

import unittest

from app.airline.sessions import create_session, get_session


class AirlineSessionsTest(unittest.TestCase):
    def test_session_round_trip(self) -> None:
        session_id = create_session([{"crew": "test"}])
        self.assertTrue(session_id.startswith("airline-"))
        self.assertEqual(get_session(session_id), [{"crew": "test"}])


if __name__ == "__main__":
    unittest.main()
