from app.db.rls import _TENANT_TABLES


def test_drift_snapshots_in_rls_tables():
    assert "drift_snapshots" in _TENANT_TABLES
    assert "remediation_program_items" in _TENANT_TABLES
