import type { DocsFeatureStatus } from "@/lib/docs/types";

export type PqcDataFormatGuide = {
  id: string;
  title: string;
  status: DocsFeatureStatus;
  intro: string;
  fields: {
    name: string;
    type: string;
    meaning: string;
    example?: string;
  }[];
  exampleLabel?: string;
  exampleJson?: string;
  notes?: string[];
};

export const pqcDataFormatGuides: PqcDataFormatGuide[] = [
  {
    id: "scan-request",
    title: "POST /pqc/scan request",
    status: "ga",
    intro:
      "Start a cryptographic inventory scan. Use fixture mode for deterministic demos; set useFixture false and provide target for live TLS discovery.",
    fields: [
      {
        name: "scenarioId",
        type: "string",
        meaning: "Pre-built scan profile (TLS inventory, handshake proof, standards crosswalk).",
        example: "bank-tls-inventory",
      },
      {
        name: "useFixture",
        type: "boolean",
        meaning: "When true, returns deterministic demo data without external network calls.",
        example: "true",
      },
      {
        name: "target",
        type: "string | null",
        meaning: "Hostname or domain for live scans when useFixture is false.",
        example: "api.example.com",
      },
      {
        name: "depth",
        type: "string | null",
        meaning: "Discovery depth hint: standard or extended chain walk.",
        example: "standard",
      },
      {
        name: "seed",
        type: "integer",
        meaning: "Fixture randomness seed for reproducible demo output.",
        example: "1234",
      },
      {
        name: "bundleSessionId",
        type: "string | null",
        meaning: "Optional session id when uploading a bundle via POST /pqc/upload-bundle first.",
      },
    ],
    exampleLabel: "Fixture scan (quickstart)",
    exampleJson: `{
  "scenarioId": "bank-tls-inventory",
  "useFixture": true,
  "seed": 1234
}`,
    notes: [
      "Send Idempotency-Key header on POST for safe retries.",
      "Schema: /docs/reference/schemas#pqc-scan-request",
    ],
  },
  {
    id: "scan-response",
    title: "PQC scan response & report JSON",
    status: "ga",
    intro:
      "Poll GET /pqc/scan/{scanId} until status is complete, then fetch GET /pqc/report/{scanId}. The report embeds assets, Mosca scoring, and optional signature block.",
    fields: [
      {
        name: "status",
        type: "string",
        meaning: "Job state: running, success, or error.",
        example: "success",
      },
      {
        name: "scanId",
        type: "string",
        meaning: "Stable identifier for report, verify, and tenant history.",
        example: "scan-abc123",
      },
      {
        name: "assets[]",
        type: "array",
        meaning: "Discovered cryptographic assets with algorithm, host, vulnerability status.",
      },
      {
        name: "mosca",
        type: "object",
        meaning: "HNDL timeline scoring: data shelf-life vs migration horizon (X + Y > Z).",
      },
      {
        name: "scoreboard",
        type: "object",
        meaning: "Readiness summary counts by algorithm family and priority tier.",
      },
      {
        name: "signature",
        type: "object",
        meaning: "ML-DSA-65 block with contentHash — verify independently at /verify.",
      },
    ],
    notes: [
      "Report formats: ?format=json|csv|cbom|pdf|bundle|executive|board|auditor",
      "Schema: /docs/reference/schemas#pqc-scan-response",
    ],
  },
  {
    id: "cbom-export",
    title: "CycloneDX CBOM export",
    status: "ga",
    intro:
      "GET /pqc/report/{scanId}?format=cbom returns CycloneDX 1.6 with cryptographic-asset components. Qtangl properties use the qtangl: namespace for scan provenance.",
    fields: [
      {
        name: "bomFormat",
        type: "string",
        meaning: "Always CycloneDX for Qtangl exports.",
        example: "CycloneDX",
      },
      {
        name: "specVersion",
        type: "string",
        meaning: "CycloneDX spec version.",
        example: "1.6",
      },
      {
        name: "metadata.properties[]",
        type: "array",
        meaning: "qtangl:scanId, qtangl:scenarioId, qtangl:readinessScore, qtangl:targetDomain.",
      },
      {
        name: "components[]",
        type: "array",
        meaning: "type cryptographic-asset entries with qtangl:algorithm, qtangl:keySize, qtangl:vulnerabilityStatus.",
      },
      {
        name: "components[].properties[]",
        type: "array",
        meaning: "Host, port, kind (tls, code_signing, etc.), standards mapping tags.",
      },
    ],
    exampleLabel: "Sample ungated CBOM",
    exampleJson: "Download: /samples/sample-cbom-bank-tls-inventory.json",
    notes: [
      "Import into CMDB/GRC via POST /pqc/cbom/ingest or tenant integrations.",
      "See CBOM aggregator guide for multi-source merge.",
    ],
  },
  {
    id: "cbom-ingest",
    title: "POST /pqc/cbom/ingest request",
    status: "pilot",
    intro:
      "Push an external CycloneDX document into the tenant CBOM aggregator. Include sourceLabel and verificationStatus for provenance.",
    fields: [
      {
        name: "document",
        type: "object",
        meaning: "Full CycloneDX BOM JSON document.",
      },
      {
        name: "sourceLabel",
        type: "string",
        meaning: "Human-readable source name (cloud provider, CLM, manual import).",
        example: "aws-kms-import",
      },
      {
        name: "verificationStatus",
        type: "string",
        meaning: "verified | imported | unverified-source — affects conflict resolution weight.",
        example: "imported",
      },
    ],
    exampleLabel: "Minimal ingest body",
    exampleJson: `{
  "document": { "bomFormat": "CycloneDX", "specVersion": "1.6", "components": [] },
  "sourceLabel": "manual-cmdb-export",
  "verificationStatus": "imported"
}`,
    notes: ["Schema: /docs/reference/schemas#pqc-cbom-ingest-request"],
  },
  {
    id: "webhook-siem",
    title: "SIEM webhook v2 payload",
    status: "ga",
    intro:
      "Monitor tier webhooks emit drift and scan-complete events. Payload includes scan metadata, delta summary, and verify URL.",
    fields: [
      {
        name: "event",
        type: "string",
        meaning: "Event type: scan.complete, drift.detected, remediation.verified, etc.",
        example: "drift.detected",
      },
      {
        name: "scanId",
        type: "string",
        meaning: "Reference scan for report and verify links.",
      },
      {
        name: "verifyUrl",
        type: "string",
        meaning: "Public verify link auditors can open without API credentials.",
      },
      {
        name: "delta",
        type: "object",
        meaning: "Added/removed/changed assets since prior scan in scope.",
      },
    ],
    notes: [
      "HMAC-SHA256 signature in X-Qtangl-Signature header.",
      "Full spec: /docs/integrations/siem-webhook-v2",
    ],
  },
];

export const pqcDataFormatsMeta = {
  title: "Data formats",
  description:
    "PQC scan payloads, CycloneDX CBOM exports, ingest shapes, and webhook fields — before you integrate Assess, Monitor, and Convert.",
  lastUpdated: "2026-06-10",
  methodHonesty:
    "Field definitions describe Qtangl API contracts. CBOM exports follow CycloneDX; full third-party BOM validation is the importer's responsibility.",
} as const;
