"""Migrate legacy remediation_status rows to program items."""

from __future__ import annotations

import argparse

from app.remediation.program import migrate_legacy_remediation_status


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate remediation status to program items")
    parser.add_argument("--tenant-id", required=True)
    args = parser.parse_args()
    count = migrate_legacy_remediation_status(tenant_id=args.tenant_id)
    print({"migrated": count})


if __name__ == "__main__":
    main()
