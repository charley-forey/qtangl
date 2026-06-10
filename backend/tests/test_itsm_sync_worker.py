from app.remediation.verify import map_external_status


def test_status_mapping_consistency():
    assert map_external_status("jira", "Resolved") == "done"
    assert map_external_status("servicenow", "Work in Progress") == "in_progress"
