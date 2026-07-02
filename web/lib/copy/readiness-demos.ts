// Re-export monitor scenario data
export {
  monitorPreviewDiff,
  monitorPreviewTrend,
  monitorPreviewSchedule,
  monitorPreviewWebhookV2,
  monitorPreviewSlackMessage,
  monitorScenarios,
  monitorScenarioList,
  getMonitorScenario,
  type MonitorScenarioId,
  type MonitorScenarioBundle,
  type MonitorWeekSnapshot,
  type MonitorDriftBySource,
  type MonitorTrendPoint,
} from "@/lib/copy/monitor-scenarios";

import type { ScanDiff } from "@/components/pqc/ScanDiffPanel";
import { monitorPreviewDiff as bankDiff } from "@/lib/copy/monitor-scenarios";

export type ConvertPreviewItem = {
  id: string;
  title: string;
  severity: string;
  owner: string;
  status: "open" | "in_progress" | "done" | "accepted_risk";
  impactPoints: number;
  playbook: string;
  wave?: 1 | 2 | 3;
  assetId?: string;
};

export const convertPreviewItems: ConvertPreviewItem[] = [
  {
    id: "rem_001",
    title: "Enable hybrid TLS (ML-KEM) on api.example.com",
    severity: "high",
    owner: "Platform team",
    status: "in_progress",
    impactPoints: 8,
    playbook: "Roll out hybrid KEX on load balancer; verify with re-scan.",
    wave: 1,
    assetId: "tls-api-bank",
  },
  {
    id: "rem_002",
    title: "Rotate JWKS signing keys to ML-DSA",
    severity: "high",
    owner: "Identity team",
    status: "open",
    impactPoints: 6,
    playbook: "Publish new JWKS; staged cutover with rollback window.",
    wave: 2,
    assetId: "jwks-oidc",
  },
  {
    id: "rem_003",
    title: "Replace RSA-2048 SSH host keys",
    severity: "medium",
    owner: "Infra team",
    status: "open",
    impactPoints: 4,
    playbook: "Generate Ed25519 host keys; update known_hosts distribution.",
    wave: 3,
    assetId: "ssh-bastion",
  },
  {
    id: "rem_004",
    title: "Upgrade email STARTTLS to PQ-safe ciphers",
    severity: "medium",
    owner: "Messaging team",
    status: "done",
    impactPoints: 3,
    playbook: "MX record scan → MTA config → re-scan verification.",
    wave: 1,
    assetId: "email-mx",
  },
];

export const convertPreviewBaseline = {
  currentScore: 61.8,
  openCount: 2,
  inProgressCount: 1,
  doneCount: 1,
  projectedDelta: 12.4,
  itemsPerWeek: 2.3,
} as const;

export const convertPreviewDiff: ScanDiff = {
  ...bankDiff,
  readinessDelta: 12.4,
  previousReadinessScore: 61.8,
  currentReadinessScore: 74.2,
  summary:
    "Hybrid TLS enabled on api.example.com; JWKS rotation in progress. Two high-severity findings resolved since last scan.",
  newQuantumVulnerableCount: 0,
};

export const convertPreviewTrend = [
  { scanId: "scan_c1", createdAt: "2026-01-10T12:00:00Z", readinessScore: 52, readinessBand: "at_risk" },
  { scanId: "scan_c2", createdAt: "2026-02-10T12:00:00Z", readinessScore: 56, readinessBand: "at_risk" },
  { scanId: "scan_c3", createdAt: "2026-03-10T12:00:00Z", readinessScore: 59, readinessBand: "at_risk" },
  { scanId: "scan_c4", createdAt: "2026-04-10T12:00:00Z", readinessScore: 61.8, readinessBand: "at_risk" },
] as const;

export const convertPreviewVelocity = [
  { week: "Jan", closed: 2 },
  { week: "Feb", closed: 4 },
  { week: "Mar", closed: 3 },
  { week: "Apr", closed: 5 },
] as const;

export const convertPreviewPeerBenchmark = {
  yourScore: 61.8,
  median: 58,
  p25: 52,
  p75: 67,
  label: "Illustrative financial services cohort (opt-in benchmark)",
};

export const convertPreviewVerifyPayload = {
  scanId: "scan_2026_04_08_bank",
  status: "verified",
  signatureAlgorithm: "ML-DSA-65",
  reportHash: "sha256:abc123…",
  verifyUrl: "https://www.qtangl.com/verify?scanId=scan_2026_04_08_bank",
};

export const convertPreviewVerifyCli = `$ qtangl-verify --scan-id scan_2026_04_08_bank --bundle evidence.zip
✓ Signature valid (ML-DSA-65)
✓ Report hash matches bundle
✓ Transparency log receipt found`;

export const convertPreviewPdfExcerpt = {
  headline: "PQC Readiness Report — api.example.com",
  readinessScore: 61.8,
  readinessBand: "at_risk",
  openCritical: 2,
  verifyUrl: "https://www.qtangl.com/verify?scanId=scan_2026_04_08_bank",
};

export const convertPreviewJiraTicket = {
  key: "PQC-142",
  status: "In Progress",
  summary: "Enable hybrid TLS (ML-KEM) on api.example.com",
  description:
    "Qtangl Convert playbook:\n1. Roll out hybrid KEX on load balancer\n2. Re-scan to verify\n3. Attach signed PDF to change ticket",
  labels: ["pqc", "qtangl", "hybrid-tls"],
};

export const convertMigrationWaves = [
  {
    wave: 1 as const,
    quarter: "Q2 2026",
    title: "Edge TLS + JWKS",
    owner: "Platform + Identity",
    steps: ["Hybrid TLS on public APIs", "JWKS ML-DSA cutover plan", "Re-scan verification"],
    checkpoint: "Public APIs ≥ transitional band",
  },
  {
    wave: 2 as const,
    quarter: "Q3 2026",
    title: "Internal + email",
    owner: "Infra + Messaging",
    steps: ["SSH host key rotation", "STARTTLS hardening", "CBOM ingest for apps"],
    checkpoint: "No new Q-vulnerable external assets",
  },
  {
    wave: 3 as const,
    quarter: "Q4 2026",
    title: "PKI + legacy",
    owner: "Security architecture",
    steps: ["CA hierarchy review", "HSM roadmap", "Board evidence pack"],
    checkpoint: "Readiness ≥ 70 with signed board export",
  },
];

export const convertPartnerNodes = [
  { id: "hsm", label: "HSM vendors", blurb: "Coordinate PQ-capable HSM evaluations with your existing contracts." },
  { id: "pki", label: "PKI integrators", blurb: "CA migration playbooks and cutover windows with rollback plans." },
  { id: "siem", label: "SIEM / GRC", blurb: "Webhook v2 ingestion and drift alert routing into your SOC pipeline." },
];
