import { defineEndpoint, ROLE_ADMIN, ROLE_ANY, ROLE_PUBLIC } from "@/lib/docs/endpoint-factory";
import type { DocsEndpoint } from "@/lib/docs/types";

export const pqcExtendedEndpoints: Record<string, DocsEndpoint> = {
  "pqc-scan-persist": defineEndpoint("pqc-scan-persist", {
    method: "POST",
    path: "/pqc/scan/{scan_id}/persist",
    summary: "Persist finalized scan outputs into tenant history for reporting and audit workflows.",
    role: ROLE_ANY,
    examples: [
      {
        label: "Persist completed scan",
        response: { status: "success", scan_id: "scan_01J...", persisted: true, retained_at: "2026-06-09T14:00:00Z" },
      },
    ],
  }),
  "pqc-report-availability": defineEndpoint("pqc-report-availability", {
    method: "GET",
    path: "/pqc/report/{scan_id}/availability",
    summary: "Check which report formats are currently available for a completed scan.",
    role: ROLE_ANY,
    examples: [
      {
        label: "Available report formats",
        response: { status: "success", scan_id: "scan_01J...", formats: ["json", "csv", "cbom", "pdf"] },
      },
    ],
  }),
  "pqc-verify-get": defineEndpoint("pqc-verify-get", {
    method: "GET",
    path: "/pqc/verify/{scan_id}",
    summary: "Public verification endpoint for a scan's published proof bundle.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [
      {
        label: "Verify published scan",
        response: { status: "success", scan_id: "scan_01J...", verified: true, root_hash: "8f0ab1..." },
      },
    ],
  }),
  "pqc-verify-post": defineEndpoint("pqc-verify-post", {
    method: "POST",
    path: "/pqc/verify",
    summary: "Public verification endpoint accepting proof payloads directly.",
    auth: false,
    role: ROLE_PUBLIC,
    requestFields: [
      {
        name: "proof",
        type: "object",
        required: true,
        description: "Signed proof payload generated from report artifacts.",
      },
    ],
    examples: [
      {
        label: "Verify supplied proof",
        request: { proof: { content_hash: "sha256:ab12...", signature: "base64..." } },
        response: { status: "success", verified: true, signer: "qtangl-transparency-key-2026-02" },
      },
    ],
  }),
  "pqc-index": defineEndpoint("pqc-index", {
    method: "GET",
    path: "/pqc/index",
    summary: "Public index of scan attestations currently anchored in transparency.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [{ label: "Latest index", response: { status: "success", total: 312, scans: [] } }],
  }),
  "pqc-index-drift": defineEndpoint("pqc-index-drift", {
    method: "GET",
    path: "/pqc/index/drift",
    summary: "Public drift summary comparing current index state to prior snapshots.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [{ label: "Drift snapshot", response: { status: "success", drift_count: 2, entries: [] } }],
  }),
  "pqc-transparency-consistency": defineEndpoint("pqc-transparency-consistency", {
    method: "GET",
    path: "/pqc/transparency/consistency",
    summary: "Public consistency proof for transparency tree growth between two checkpoints.",
    auth: false,
    role: ROLE_PUBLIC,
    queryParams: [
      {
        name: "from_size",
        type: "integer",
        required: false,
        description: "Earlier tree size for consistency validation.",
      },
      {
        name: "to_size",
        type: "integer",
        required: false,
        description: "Later tree size for consistency validation.",
      },
    ],
    examples: [{ label: "Consistency proof", response: { status: "success", proof: [], from_size: 640, to_size: 672 } }],
  }),
  "pqc-transparency-witnesses": defineEndpoint("pqc-transparency-witnesses", {
    method: "GET",
    path: "/pqc/transparency/witnesses",
    summary: "Public list of witness identities and recent signatures.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [{ label: "Witness list", response: { status: "success", witnesses: [] } }],
  }),
  "pqc-transparency-witness-submit": defineEndpoint("pqc-transparency-witness-submit", {
    method: "POST",
    path: "/pqc/transparency/witness",
    summary: "Public witness submission endpoint for signed checkpoint acknowledgements.",
    auth: false,
    role: ROLE_PUBLIC,
    requestFields: [
      {
        name: "checkpoint",
        type: "object",
        required: true,
        description: "Checkpoint and witness signature bundle.",
      },
    ],
    examples: [
      {
        label: "Submit witness signature",
        request: { checkpoint: { tree_size: 672, root_hash: "8f0ab1...", signature: "base64..." } },
        response: { status: "success", accepted: true, witness_id: "witness-eu-2" },
      },
    ],
  }),
  "pqc-transparency-root": defineEndpoint("pqc-transparency-root", {
    method: "GET",
    path: "/pqc/transparency/root",
    summary: "Public latest root checkpoint for the PQC transparency log.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [{ label: "Current root", response: { status: "success", seq: 672, root_hash: "8f0ab1..." } }],
  }),
  "pqc-transparency-keys": defineEndpoint("pqc-transparency-keys", {
    method: "GET",
    path: "/pqc/transparency/keys",
    summary: "Public key history and active signing key metadata.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [{ label: "Key history", response: { status: "success", active_key_id: "key_2026_02", keys: [] } }],
  }),
  "pqc-transparency-inclusion": defineEndpoint("pqc-transparency-inclusion", {
    method: "GET",
    path: "/pqc/transparency/{content_hash}",
    summary: "Public inclusion proof lookup for a report content hash.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [
      {
        label: "Inclusion proof",
        response: { status: "success", content_hash: "sha256:ab12...", inclusion: { seq: 413, root_hash: "8f0ab1..." } },
      },
    ],
  }),
  "pqc-transparency-retire-key": defineEndpoint("pqc-transparency-retire-key", {
    method: "POST",
    path: "/pqc/transparency/keys/retire",
    summary: "Admin endpoint to retire a transparency signing key and publish a rotation notice.",
    role: ROLE_ADMIN,
    requestFields: [
      {
        name: "key_id",
        type: "string",
        required: true,
        description: "Signing key identifier to retire.",
        example: "key_2025_11",
      },
    ],
    examples: [
      {
        label: "Retire key",
        request: { key_id: "key_2025_11", reason: "Scheduled annual rotation" },
        response: { status: "success", retired: true, replaced_by: "key_2026_02" },
      },
    ],
  }),
  "pqc-cbom-sources": defineEndpoint("pqc-cbom-sources", {
    method: "GET",
    path: "/pqc/cbom/sources",
    summary: "List currently configured CBOM source systems and pull status.",
    role: ROLE_ANY,
    examples: [{ label: "Configured sources", response: { status: "success", sources: [] } }],
  }),
  "pqc-cbom-aggregate": defineEndpoint("pqc-cbom-aggregate", {
    method: "GET",
    path: "/pqc/cbom/aggregate",
    summary: "Return tenant-level merged CBOM with provenance and normalization summaries.",
    role: ROLE_ANY,
    examples: [{ label: "Aggregate CBOM", response: { status: "success", aggregate: { components: [] } } }],
  }),
  "pqc-cbom-conflicts": defineEndpoint("pqc-cbom-conflicts", {
    method: "GET",
    path: "/pqc/cbom/conflicts",
    summary: "List unresolved CBOM merge conflicts requiring operator adjudication.",
    role: ROLE_ANY,
    examples: [{ label: "Conflict list", response: { status: "success", total: 3, conflicts: [] } }],
  }),
  "pqc-cbom-conflict-resolve": defineEndpoint("pqc-cbom-conflict-resolve", {
    method: "PUT",
    path: "/pqc/cbom/conflicts/{conflict_id}",
    summary: "Resolve a CBOM conflict with a chosen canonical component record.",
    role: ROLE_ANY,
    requestFields: [
      {
        name: "resolution",
        type: '"choose_source" | "merge_fields" | "ignore"',
        required: true,
        description: "Conflict resolution strategy.",
      },
    ],
    examples: [
      {
        label: "Resolve by source preference",
        request: { resolution: "choose_source", source_id: "acm-prod" },
        response: { status: "success", conflict_id: "conf_01J...", resolved: true },
      },
    ],
  }),
  "pqc-cbom-diff": defineEndpoint("pqc-cbom-diff", {
    method: "GET",
    path: "/pqc/cbom/diff",
    summary: "Compare two CBOM snapshots to surface cryptographic drift and net changes.",
    role: ROLE_ANY,
    queryParams: [
      {
        name: "base_snapshot",
        type: "string",
        required: false,
        description: "Earlier snapshot identifier.",
      },
      {
        name: "target_snapshot",
        type: "string",
        required: false,
        description: "Later snapshot identifier.",
      },
    ],
    examples: [{ label: "CBOM diff", response: { status: "success", added: [], removed: [], changed: [] } }],
  }),
  "pqc-cbom-cloud-pull": defineEndpoint("pqc-cbom-cloud-pull", {
    method: "POST",
    path: "/pqc/cbom/pull/{provider}",
    summary: "Trigger a cloud pull from provider inventory and ingest the resulting CBOM snapshot.",
    role: ROLE_ANY,
    examples: [
      {
        label: "AWS CBOM pull",
        response: {
          status: "success",
          provider: "aws",
          pull: { ok: true, component_count: 58 },
          ingest: { ok: true, snapshot_id: "cbom_01J..." },
        },
      },
    ],
  }),
};
