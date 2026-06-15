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
        status: "ga",
      },
      {
        title: "Transparency log",
        description: "Append-only hash chain, inclusion proofs, witness co-signing, key retirement.",
        status: "pilot",
      },
      {
        title: "Monitor tier — schedules & webhooks",
        description: "Scheduled re-scans, drift alerts, SIEM v2 webhooks with HMAC and DLQ replay.",
        status: "ga",
      },
      {
        title: "Enterprise documentation",
        description: "Full Tenant API reference, RBAC matrix, OpenAPI artifact, CI coverage gate.",
        status: "ga",
      },
    ],
  },
  {
    id: "next",
    label: "Next",
    items: [
      {
        title: "Official TypeScript & Python SDKs",
        description: "v0.9 beta — published npm/PyPI clients with idempotency, verify helpers, and retry policies.",
        status: "pilot",
      },
      {
        title: "Cloud / KMS import GA",
        description: "Read-only credential model for AWS KMS, Azure Key Vault, Keyfactor inventory.",
        status: "pilot",
      },
      {
        title: "SOC 2 Type I observation",
        description: "Control evidence collection in progress — no certification claim until complete.",
        status: "pilot",
      },
    ],
  },
  {
    id: "later",
    label: "Later",
    items: [
      {
        title: "EU data residency region",
        description: "Dedicated EU deployment for regulated tenants by enterprise agreement.",
        status: "coming-soon",
      },
      {
        title: "Product SBOM publication",
        description: "Public CycloneDX SBOM for Qtangl platform components (dogfood CBOM).",
        status: "pilot",
      },
      {
        title: "Routing & allocation solvers",
        description: "Labs expansion motion for hybrid optimization demos — secondary to readiness.",
        status: "research",
      },
    ],
  },
];
