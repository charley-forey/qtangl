from __future__ import annotations

import unittest

from app.hospital.sessions import create_session, delete_session, get_session


class HospitalSessionStoreTest(unittest.TestCase):
    def test_create_and_delete_session(self) -> None:
        session_id = create_session({"ok": True})

        self.assertEqual(get_session(session_id), {"ok": True})
        delete_session(session_id)
        self.assertIsNone(get_session(session_id))


if __name__ == "__main__":
    unittest.main()
