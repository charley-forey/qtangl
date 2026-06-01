import type { ScanDiff } from "@/components/pqc/ScanDiffPanel";

export const monitorPreviewDiff: ScanDiff = {
  previousScanId: "scan_2026_04_01_bank",
  readinessDelta: -4.2,
  previousReadinessScore: 66,
  currentReadinessScore: 61.8,
  summary:
    "Two new quantum-vulnerable TLS endpoints and one RSA-2048 certificate downgrade detected since last week's scan.",
  newQuantumVulnerableCount: 2,
  certExpiringCount: 3,
  newQuantumVulnerable: [
    { label: "api-v2.example.com:443", host: "api-v2.example.com", severity: "high" },
    { label: "staging-jwks.example.com:443", host: "staging-jwks.example.com", severity: "medium" },
  ],
  degradedAlgorithms: [
    { label: "payments.example.com", previousStatus: "transitional", currentStatus: "quantum_vulnerable" },
  ],
  driftCauses: [
    { cause: "New external endpoint", count: 2 },
    { cause: "Certificate rotation", count: 1 },
    { cause: "Cipher suite downgrade", count: 1 },
  ],
};

export const monitorPreviewTrend = [
  { scanId: "scan_w1", createdAt: "2026-03-10T12:00:00Z", readinessScore: 58, readinessBand: "at_risk" },
  { scanId: "scan_w2", createdAt: "2026-03-17T12:00:00Z", readinessScore: 61, readinessBand: "at_risk" },
  { scanId: "scan_w3", createdAt: "2026-03-24T12:00:00Z", readinessScore: 64, readinessBand: "developing" },
  { scanId: "scan_w4", createdAt: "2026-04-01T12:00:00Z", readinessScore: 66, readinessBand: "developing" },
  { scanId: "scan_w5", createdAt: "2026-04-08T12:00:00Z", readinessScore: 61.8, readinessBand: "at_risk" },
] as const;

export const monitorPreviewSchedule = {
  target: "api.example.com",
  cadence: "Weekly",
  nextRun: "2026-04-15T09:00:00Z",
  notifyEmail: "ciso@example.com",
  alertThreshold: "New quantum-vulnerable asset",
} as const;

export const monitorPreviewWebhookV2 = {
  schemaVersion: "qtangl-webhook-v2",
  event: "scan.complete",
  tenantId: "tenant-acme",
  scanId: "scan_2026_04_08_bank",
  targetDomain: "api.example.com",
  readinessScore: 61.8,
  readinessBand: "at_risk",
  verifyUrl: "https://www.qtangl.com/verify?scanId=scan_2026_04_08_bank",
  evidenceZipUrl: "https://api.qtangl.com/tenant/scans/scan_2026_04_08_bank/report?format=bundle",
  message: "New quantum-vulnerable TLS endpoint detected on api-v2.example.com",
  alerts: [
    {
      severity: "high",
      code: "new_quantum_vulnerable",
      message: "2 new quantum-vulnerable endpoints since last scan",
    },
    {
      severity: "medium",
      code: "readiness_regression",
      message: "Readiness score dropped 4.2 points (66.0 → 61.8)",
    },
  ],
  scanDiff: {
    previousScanId: "scan_2026_04_01_bank",
    readinessDelta: -4.2,
    newQuantumVulnerableCount: 2,
    certExpiringCount: 3,
  },
  topFindings: [
    { label: "api-v2.example.com:443", severity: "high" },
    { label: "staging-jwks.example.com:443", severity: "medium" },
  ],
} as const;

export const monitorPreviewSlackMessage =
  "Qtangl: 2 new quantum-vulnerable endpoints since last scan (scan scan_2026_04_08_bank)";

export type ConvertPreviewItem = {
  id: string;
  title: string;
  severity: string;
  owner: string;
  status: "open" | "in_progress" | "done" | "accepted_risk";
  impactPoints: number;
  playbook: string;
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
  },
  {
    id: "rem_002",
    title: "Rotate JWKS signing keys to ML-DSA",
    severity: "high",
    owner: "Identity team",
    status: "open",
    impactPoints: 6,
    playbook: "Publish new JWKS; staged cutover with rollback window.",
  },
  {
    id: "rem_003",
    title: "Replace RSA-2048 SSH host keys",
    severity: "medium",
    owner: "Infra team",
    status: "open",
    impactPoints: 4,
    playbook: "Generate Ed25519 host keys; update known_hosts distribution.",
  },
  {
    id: "rem_004",
    title: "Upgrade email STARTTLS to PQ-safe ciphers",
    severity: "medium",
    owner: "Messaging team",
    status: "done",
    impactPoints: 3,
    playbook: "MX record scan → MTA config → re-scan verification.",
  },
];

export const convertPreviewBaseline = {
  currentScore: 61.8,
  openCount: 2,
  inProgressCount: 1,
  doneCount: 1,
} as const;
