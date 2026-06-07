import type { DocsFeatureStatus } from "@/lib/docs/types";

export type RoadmapItem = {
  title: string;
  description: string;
  status: DocsFeatureStatus;
};

export type RoadmapBand = {
  id: "now" | "next" | "later";
  label: string;
  items: RoadmapItem[];
};

export const roadmapBands: RoadmapBand[] = [
  {
    id: "now",
    label: "Now",
    items: [
      {
        title: "Q-Day readiness scanner",
        description: "Pilot /pqc/* cryptographic inventory, Mosca risk, CBOM exports, PQ handshake proof.",
        status: "pilot",
      },
      {
        title: "PQ-signed verifiable evidence",
        description: "ML-DSA-65 / Ed25519 signed reports, public /verify, stable signing key registry.",
        status: "pilot",
      },
      {
        title: "Transparency log MVP",
        description: "Append-only hash chain for report content hashes; inclusion proofs on verify.",
        status: "pilot",
      },
      {
        title: "Scheduled scans & drift",
        description: "Monitor tier cadence, scan diff alerts, regression webhooks.",
        status: "pilot",
      },
      {
        title: "CBOM import & merge",
        description: "Neutral aggregator: ingest third-party CycloneDX CBOMs with provenance labeling and conflict queue.",
        status: "pilot",
      },
      {
        title: "Developer docs platform",
        description: "Search, schemas, per-endpoint reference, verify spec, and operations guides.",
        status: "ga",
      },
    ],
  },
  {
    id: "next",
    label: "Next",
    items: [
      {
        title: "Readiness Passport",
        description: "Revocable share links for auditors and MSSPs with verify + log inclusion.",
        status: "pilot",
      },
      {
        title: "Cloud / KMS import GA",
        description: "Read-only credential model for AWS KMS, Azure Key Vault inventory.",
        status: "pilot",
      },
      {
        title: "Schedule optimization (GA)",
        description: "CP-SAT baseline on every job; hybrid QAOA on bounded research candidates.",
        status: "ga",
      },
    ],
  },
  {
    id: "later",
    label: "Later",
    items: [
      {
        title: "Open verify spec + offline CLI",
        description: "Published verify-spec.md; third-party verification without dashboard login.",
        status: "pilot",
      },
      {
        title: "SIEM & webhook integrations",
        description: "Export verify events and drift alerts to enterprise observability stacks.",
        status: "coming-soon",
      },
      {
        title: "SOC 2 readiness",
        description: "Security questionnaire pack and retention controls for production tenants.",
        status: "coming-soon",
      },
      {
        title: "Routing & allocation solvers",
        description: "Expansion motion for hybrid optimization demos — secondary to readiness.",
        status: "research",
      },
    ],
  },
];
