"""Trust & evidence surfaces for Command Center."""

from __future__ import annotations

from typing import Any

from app.command_center.schemas import AuditorPacketResponse, TransparencyEntry, TransparencyLogResponse
from app.pqc.transparency import current_root, list_recent_entries


def build_transparency_view(*, limit: int = 50) -> TransparencyLogResponse:
    root_info = current_root()
    root = str(root_info.get("rootHash") or root_info.get("merkleRoot") or "")
    entries_raw = list_recent_entries(limit=limit)
    entries = [
        TransparencyEntry(
            seq=int(e.get("seq") or 0),
            contentHash=str(e.get("content_hash") or e.get("contentHash") or ""),
            entryHash=str(e.get("entry_hash") or e.get("entryHash") or ""),
            scanId=e.get("scan_id") or e.get("scanId"),
            createdAt=e.get("created_at") or e.get("createdAt"),
        )
        for e in entries_raw
    ]
    return TransparencyLogResponse(
        rootHash=root,
        entries=entries,
        total=len(entries),
        verifyInstructions="Run: qtangl-verify <scan-id> — confirms report signing integrity, not estate coverage.",
    )


def build_auditor_packet(*, tenant_id: str, scan_ids: list[str]) -> AuditorPacketResponse:
  base = "https://api.qtangl.com"
  return AuditorPacketResponse(
      scanIds=scan_ids,
      bundleUrls=[f"{base}/pqc/report/{sid}?format=bundle" for sid in scan_ids],
      verifyCli="qtangl-verify <scan-id>",
      caveats=[
          "Signed reports attest to inventory captured at scan time — not continuous monitoring.",
          "Verification confirms cryptographic signing integrity only.",
          "This packet is an inventory aid, not a formal audit or certification.",
      ],
  )
