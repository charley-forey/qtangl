from app.remediation.playbooks import playbook_for_item
from app.remediation.verify import map_external_status


def test_playbook_for_host_cacerts():
    item = {"sourceType": "host_finding", "title": "Update JVM cacerts trust store"}
    pb = playbook_for_item(item)
    assert pb["playbookKey"] == "jvm_cacerts"
    assert len(pb["steps"]) >= 3


def test_map_jira_status():
    assert map_external_status("jira", "Done") == "done"
    assert map_external_status("jira", "In Progress") == "in_progress"


def test_map_servicenow_status():
    assert map_external_status("servicenow", "Closed") == "done"
