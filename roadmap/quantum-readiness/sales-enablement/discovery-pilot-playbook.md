# Discovery depth — enterprise pilot playbook

## Scope

500+ agent rollout or 10+ critical repos with code/binary scan.

## Week 1

- Enable feature flags: `hostSensor`, `codeScan`, `binaryScan`
- Create fleet; deploy sensor to 50-host canary via Helm or Ansible
- Connect GitHub App for top 3 repos

## Week 2

- Validate findings → CBOM merge; resolve merge conflicts
- CMDB correlation (ServiceNow read-only pull)
- Coverage confidence target: >50%

## Week 4

- Scale to 500+ agents
- Enable Monitor schedules: `host_fleet_scan`, `repo_scheduled_scan`
- Executive readout: coverage confidence + signed evidence export

## Success criteria

- Agent install → first findings <15 min
- <2% cert false positive rate on pilot sample
- Code scan median <5 min for 1k-file repo

## Escalation

See [discovery-runbooks.md](../ops/discovery-runbooks.md).
