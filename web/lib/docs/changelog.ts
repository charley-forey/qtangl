import type { DocsFeatureStatus } from "@/lib/docs/types";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  tags?: string[];
  items: string[];
};

export const tagToStatus: Record<string, DocsFeatureStatus> = {
  ga: "ga",
  pilot: "pilot",
  docs: "ga",
  breaking: "deprecated",
};
export const changelog: ChangelogEntry[] = [
  {
    version: "0.9.1-docs",
    date: "2026-06-09",
    title: "Enterprise documentation overhaul",
    tags: ["docs", "ga"],
    items: [
      "Full Tenant API reference (56 endpoints) with RBAC matrix and dynamic reference pages.",
      "PQC verify, transparency, CBOM, and Readiness Index reference coverage.",
      "Re-anchored Quickstart, Authentication, and API guide to PQC Assess → Monitor → Convert.",
      "Trust Center expansion: compliance status, data residency, incident response, sub-processors.",
      "Published OpenAPI artifact, Postman collection, and CI docs coverage gate.",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-06-08",
    title: "Enterprise readiness release",
    tags: ["ga"],
    items: [
      "Multi-tenant Postgres with RLS, audit log export, and admin API for key lifecycle.",
      "Stripe Monitor self-serve with one-time onboarding tokens — no plaintext API keys in email.",
      "Evidence vault retention, OIDC SSO config, transparency log, and qtangl-verify offline CLI.",
      "Webhooks with HMAC signing, DLQ, and replay; SIEM v2 schema for scan.complete events.",
      "Compliance kickoff checklists (SOC 2, legal, pen-test scope) and staging conversion smoke in CI.",
    ],
  },
  {
    version: "0.2.0-pilot",
    date: "2026-05-28",
    title: "Q-Day readiness scanner",
    tags: ["pilot"],
    items: [
      "PQC migration endpoints under /pqc/* with fixture and live scan modes.",
      "Mosca HNDL risk scoring, CycloneDX CBOM export, and ML-KEM handshake proof.",
      "Interactive /assess command center and initial API reference docs.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-27",
    title: "Enterprise docs surface",
    tags: ["docs"],
    items: [
      "Documentation platform with grouped navigation, search, and per-endpoint reference.",
      "JSON Schema viewer sourced from backend contracts.",
      "Roadmap and changelog pages for operational honesty.",
    ],
  },
];
