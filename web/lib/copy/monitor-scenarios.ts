import type { ScanDiff } from "@/components/pqc/ScanDiffPanel";
import type { WeeklyDigest } from "@/components/dashboard/ExecutiveDigestCard";

export type MonitorScenarioId = "bank" | "healthcare" | "government";

export type MonitorTrendPoint = {
  scanId: string;
  createdAt: string;
  readinessScore: number;
  readinessBand: string;
};

export type MonitorWeekSnapshot = {
  weekLabel: string;
  createdAt: string;
  diff: ScanDiff;
  trendPoint: MonitorTrendPoint;
};

export type MonitorDriftBySource = {
  external: { added: number; removed: number };
  host: { added: number; removed: number };
  code: { added: number; removed: number };
  cbom: { added: number; removed: number };
};

export type MonitorScenarioBundle = {
  id: MonitorScenarioId;
  label: string;
  description: string;
  target: string;
  cadence: string;
  nextRun: string;
  alertThreshold: string;
  readinessScore: number;
  readinessDelta: number;
  newQuantumVulnerableCount: number;
  certExpiringCount: number;
  livePulse: {
    lastScanAgo: string;
    schedulerStatus: "healthy" | "offline";
    unreadAlerts: number;
  };
  evidenceFreshness: {
    lastSignedReport: string;
    verifyActive: boolean;
    vaultRetention: string;
  };
  weeks: MonitorWeekSnapshot[];
  driftBySource: MonitorDriftBySource;
  commandCenter: {
    businessUnits: Record<string, number>;
    deltas: Record<string, number | null>;
  };
  digest: WeeklyDigest;
  forecast: { current: number; projected: number; slope: number };
  severitySlices: { label: string; value: number; color: string }[];
  algorithmRows: { label: string; count: number }[];
  remediationVelocity: { week: string; open: number; closed: number }[];
  peerBenchmark: {
    yourScore: number;
    median: number;
    p25: number;
    p75: number;
    sampleSize: number;
    industry: string;
  };
  portfolioChildren: {
    name: string;
    readiness: number;
    openAlerts: number;
    tier: string;
  }[];
  slackMessage: string;
  teamsMessage: string;
  webhook: {
    schemaVersion: string;
    event: string;
    tenantId: string;
    scanId: string;
    targetDomain: string;
    readinessScore: number;
    readinessBand: string;
    verifyUrl: string;
    evidenceZipUrl: string;
    message: string;
    alerts: { severity: string; code: string; message: string }[];
    scanDiff: {
      previousScanId: string;
      readinessDelta: number;
      newQuantumVulnerableCount: number;
      certExpiringCount: number;
    };
    topFindings: { label: string; severity: string }[];
  };
};

const bankWeeks: MonitorWeekSnapshot[] = [
  {
    weekLabel: "Week 1",
    createdAt: "2026-02-20T12:00:00Z",
    trendPoint: { scanId: "scan_b1", createdAt: "2026-02-20T12:00:00Z", readinessScore: 58, readinessBand: "at_risk" },
    diff: {
      previousScanId: "scan_b0",
      readinessDelta: 0,
      previousReadinessScore: 58,
      currentReadinessScore: 58,
      summary: "Baseline established for api.example.com portfolio.",
      newQuantumVulnerableCount: 0,
      certExpiringCount: 1,
    },
  },
  {
    weekLabel: "Week 2",
    createdAt: "2026-02-27T12:00:00Z",
    trendPoint: { scanId: "scan_b2", createdAt: "2026-02-27T12:00:00Z", readinessScore: 61, readinessBand: "at_risk" },
    diff: {
      previousScanId: "scan_b1",
      readinessDelta: 3,
      previousReadinessScore: 58,
      currentReadinessScore: 61,
      summary: "Minor remediation closed two medium findings.",
      newQuantumVulnerableCount: 0,
      certExpiringCount: 2,
    },
  },
  {
    weekLabel: "Week 3",
    createdAt: "2026-03-06T12:00:00Z",
    trendPoint: { scanId: "scan_b3", createdAt: "2026-03-06T12:00:00Z", readinessScore: 64, readinessBand: "developing" },
    diff: {
      previousScanId: "scan_b2",
      readinessDelta: 3,
      previousReadinessScore: 61,
      currentReadinessScore: 64,
      summary: "Hybrid TLS pilot improved payments.example.com score.",
      newQuantumVulnerableCount: 0,
      certExpiringCount: 2,
    },
  },
  {
    weekLabel: "Week 4",
    createdAt: "2026-03-13T12:00:00Z",
    trendPoint: { scanId: "scan_b4", createdAt: "2026-03-13T12:00:00Z", readinessScore: 66, readinessBand: "developing" },
    diff: {
      previousScanId: "scan_b3",
      readinessDelta: 2,
      previousReadinessScore: 64,
      currentReadinessScore: 66,
      summary: "Stable week — no new quantum-vulnerable assets.",
      newQuantumVulnerableCount: 0,
      certExpiringCount: 3,
    },
  },
  {
    weekLabel: "Week 5",
    createdAt: "2026-03-20T12:00:00Z",
    trendPoint: { scanId: "scan_b5", createdAt: "2026-03-20T12:00:00Z", readinessScore: 63, readinessBand: "developing" },
    diff: {
      previousScanId: "scan_b4",
      readinessDelta: -3,
      previousReadinessScore: 66,
      currentReadinessScore: 63,
      summary: "New staging endpoint introduced RSA-2048 TLS.",
      newQuantumVulnerableCount: 1,
      certExpiringCount: 3,
      driftCauses: [{ cause: "New external endpoint", count: 1 }],
    },
  },
  {
    weekLabel: "Week 6",
    createdAt: "2026-03-27T12:00:00Z",
    trendPoint: { scanId: "scan_b6", createdAt: "2026-03-27T12:00:00Z", readinessScore: 65, readinessBand: "developing" },
    diff: {
      previousScanId: "scan_b5",
      readinessDelta: 2,
      previousReadinessScore: 63,
      currentReadinessScore: 65,
      summary: "Staging endpoint remediated; score recovering.",
      newQuantumVulnerableCount: 0,
      certExpiringCount: 3,
    },
  },
  {
    weekLabel: "Week 7",
    createdAt: "2026-04-03T12:00:00Z",
    trendPoint: { scanId: "scan_b7", createdAt: "2026-04-03T12:00:00Z", readinessScore: 66, readinessBand: "developing" },
    diff: {
      previousScanId: "scan_b6",
      readinessDelta: 1,
      previousReadinessScore: 65,
      currentReadinessScore: 66,
      summary: "Certificate rotation completed on payments.example.com.",
      newQuantumVulnerableCount: 0,
      certExpiringCount: 2,
      driftCauses: [{ cause: "Certificate rotation", count: 1 }],
    },
  },
  {
    weekLabel: "Week 8",
    createdAt: "2026-04-10T12:00:00Z",
    trendPoint: { scanId: "scan_b8", createdAt: "2026-04-10T12:00:00Z", readinessScore: 61.8, readinessBand: "at_risk" },
    diff: {
      previousScanId: "scan_b7",
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
    },
  },
];

export const monitorScenarios: Record<MonitorScenarioId, MonitorScenarioBundle> = {
  bank: {
    id: "bank",
    label: "Financial services",
    description: "TLS portfolio drift across payment APIs and JWKS endpoints.",
    target: "api.example.com",
    cadence: "Weekly",
    nextRun: "2026-04-17T09:00:00Z",
    alertThreshold: "New quantum-vulnerable asset",
    readinessScore: 61.8,
    readinessDelta: -4.2,
    newQuantumVulnerableCount: 2,
    certExpiringCount: 3,
    livePulse: { lastScanAgo: "2h ago", schedulerStatus: "healthy", unreadAlerts: 2 },
    evidenceFreshness: {
      lastSignedReport: "2 days ago",
      verifyActive: true,
      vaultRetention: "24h for PEM uploads",
    },
    weeks: bankWeeks,
    driftBySource: {
      external: { added: 8, removed: 2 },
      host: { added: 1, removed: 0 },
      code: { added: 3, removed: 1 },
      cbom: { added: 5, removed: 0 },
    },
    commandCenter: {
      businessUnits: { Payments: 58, "Retail API": 64, Treasury: 71, Identity: 55 },
      deltas: { Payments: -6, "Retail API": -2, Treasury: 0, Identity: -4 },
    },
    digest: {
      headline: "Readiness regressed 4.2 pts — two new Q-vulnerable endpoints need owner assignment",
      wins: ["Treasury BU held steady at 71", "Hybrid TLS pilot verified on api.example.com"],
      risks: ["api-v2.example.com:443 flagged high severity", "3 certs expiring within 30 days"],
      nextWeekFocus: ["Assign owner for api-v2 remediation", "Review cipher policy on payments LB"],
      sinceLastBoardMeeting: "Since last board review: readiness dropped from 66 → 61.8",
      topCryptoRisks: ["RSA-2048 on new staging endpoints", "JWKS signing key still classical"],
      narrative: "Illustrative weekly digest — export real digests from your tenant dashboard.",
    },
    forecast: { current: 61.8, projected: 58.4, slope: -1.7 },
    severitySlices: [
      { label: "Critical", value: 2, color: "#f87171" },
      { label: "High", value: 5, color: "#fb923c" },
      { label: "Medium", value: 8, color: "#fbbf24" },
      { label: "Low", value: 4, color: "#94a3b8" },
    ],
    algorithmRows: [
      { label: "RSA-2048", count: 12 },
      { label: "ECDSA P-256", count: 8 },
      { label: "Ed25519", count: 3 },
      { label: "ML-KEM (hybrid)", count: 2 },
    ],
    remediationVelocity: [
      { week: "W1", open: 18, closed: 2 },
      { week: "W2", open: 17, closed: 4 },
      { week: "W3", open: 15, closed: 5 },
      { week: "W4", open: 14, closed: 3 },
      { week: "W5", open: 16, closed: 2 },
      { week: "W6", open: 15, closed: 4 },
      { week: "W7", open: 14, closed: 3 },
      { week: "W8", open: 19, closed: 1 },
    ],
    peerBenchmark: {
      yourScore: 61.8,
      median: 58,
      p25: 52,
      p75: 67,
      sampleSize: 847,
      industry: "financial services",
    },
    portfolioChildren: [
      { name: "Acme Bank NA", readiness: 61.8, openAlerts: 2, tier: "monitor" },
      { name: "Acme Payments LLC", readiness: 55, openAlerts: 4, tier: "monitor" },
      { name: "Acme Trust Co", readiness: 71, openAlerts: 0, tier: "assess" },
    ],
    slackMessage:
      "Qtangl: 2 new quantum-vulnerable endpoints since last scan (scan scan_2026_04_08_bank)",
    teamsMessage:
      "Qtangl Monitor — Readiness 61.8 (at_risk). 2 new Q-vulnerable endpoints. Verify: qtangl.com/verify?scanId=scan_2026_04_08_bank",
    webhook: {
      schemaVersion: "qtangl-webhook-v2",
      event: "scan.complete",
      tenantId: "tenant-acme-bank",
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
    },
  },
  healthcare: {
    id: "healthcare",
    label: "Healthcare",
    description: "HIPAA-sensitive JWKS, email TLS, and cert expiry clusters.",
    target: "patient-portal.example.org",
    cadence: "Weekly",
    nextRun: "2026-04-16T06:00:00Z",
    alertThreshold: "Cert expiring ≤30 days",
    readinessScore: 54.2,
    readinessDelta: -2.8,
    newQuantumVulnerableCount: 1,
    certExpiringCount: 7,
    livePulse: { lastScanAgo: "5h ago", schedulerStatus: "healthy", unreadAlerts: 3 },
    evidenceFreshness: {
      lastSignedReport: "5 days ago",
      verifyActive: true,
      vaultRetention: "24h for PEM uploads",
    },
    weeks: bankWeeks.map((w, i) => ({
      ...w,
      trendPoint: {
        ...w.trendPoint,
        scanId: `scan_h${i + 1}`,
        readinessScore: Math.max(48, w.trendPoint.readinessScore - 8),
      },
      diff: {
        ...w.diff,
        previousScanId: i > 0 ? `scan_h${i}` : w.diff.previousScanId,
        currentReadinessScore: Math.max(48, (w.diff.currentReadinessScore ?? 58) - 8),
        previousReadinessScore: Math.max(48, (w.diff.previousReadinessScore ?? 58) - 8),
      },
    })),
    driftBySource: {
      external: { added: 4, removed: 1 },
      host: { added: 2, removed: 0 },
      code: { added: 6, removed: 2 },
      cbom: { added: 3, removed: 1 },
    },
    commandCenter: {
      businessUnits: { "Patient portal": 52, "Clinical API": 58, "Email/MX": 49, "EHR integration": 61 },
      deltas: { "Patient portal": -3, "Clinical API": -1, "Email/MX": -5, "EHR integration": 0 },
    },
    digest: {
      headline: "7 certificates expiring within 30 days — email STARTTLS downgrade detected",
      wins: ["EHR integration BU stable at 61", "JWKS rotation scheduled for Q3"],
      risks: ["mail.example.org STARTTLS cipher downgrade", "Patient portal JWKS still RSA-2048"],
      nextWeekFocus: ["Renew expiring certs on clinical API", "Review MX STARTTLS policy"],
      topCryptoRisks: ["Long-lived PHI encryption keys", "Email in transit exposure"],
      narrative: "Illustrative healthcare scenario — not real patient data.",
    },
    forecast: { current: 54.2, projected: 50.1, slope: -2.1 },
    severitySlices: [
      { label: "Critical", value: 3, color: "#f87171" },
      { label: "High", value: 7, color: "#fb923c" },
      { label: "Medium", value: 11, color: "#fbbf24" },
      { label: "Low", value: 6, color: "#94a3b8" },
    ],
    algorithmRows: [
      { label: "RSA-2048", count: 18 },
      { label: "ECDSA P-256", count: 6 },
      { label: "STARTTLS weak", count: 4 },
      { label: "Ed25519", count: 1 },
    ],
    remediationVelocity: [
      { week: "W1", open: 24, closed: 1 },
      { week: "W2", open: 23, closed: 2 },
      { week: "W3", open: 22, closed: 3 },
      { week: "W4", open: 21, closed: 2 },
      { week: "W5", open: 23, closed: 1 },
      { week: "W6", open: 22, closed: 2 },
      { week: "W7", open: 21, closed: 3 },
      { week: "W8", open: 27, closed: 1 },
    ],
    peerBenchmark: {
      yourScore: 54.2,
      median: 51,
      p25: 45,
      p75: 58,
      sampleSize: 412,
      industry: "healthcare",
    },
    portfolioChildren: [
      { name: "Regional Health System", readiness: 54.2, openAlerts: 3, tier: "monitor" },
      { name: "Affiliate Clinic Network", readiness: 48, openAlerts: 5, tier: "assess" },
    ],
    slackMessage: "Qtangl: 7 certs expiring ≤30d + STARTTLS downgrade on mail.example.org",
    teamsMessage:
      "Qtangl Monitor — Healthcare tenant readiness 54.2. Cert expiry cluster + email TLS drift.",
    webhook: {
      schemaVersion: "qtangl-webhook-v2",
      event: "scan.complete",
      tenantId: "tenant-health-demo",
      scanId: "scan_2026_04_08_health",
      targetDomain: "patient-portal.example.org",
      readinessScore: 54.2,
      readinessBand: "at_risk",
      verifyUrl: "https://www.qtangl.com/verify?scanId=scan_2026_04_08_health",
      evidenceZipUrl: "https://api.qtangl.com/tenant/scans/scan_2026_04_08_health/report?format=bundle",
      message: "STARTTLS cipher downgrade on mail.example.org",
      alerts: [
        {
          severity: "high",
          code: "cert_expiring_30d",
          message: "7 certificates expiring within 30 days",
        },
        {
          severity: "medium",
          code: "algorithm_degraded",
          message: "Email STARTTLS cipher suite downgrade detected",
        },
      ],
      scanDiff: {
        previousScanId: "scan_2026_04_01_health",
        readinessDelta: -2.8,
        newQuantumVulnerableCount: 1,
        certExpiringCount: 7,
      },
      topFindings: [
        { label: "mail.example.org:25", severity: "high" },
        { label: "jwks.example.org:443", severity: "medium" },
      ],
    },
  },
  government: {
    id: "government",
    label: "Government",
    description: "NSM-10 / CNSA 2.0 deadline pressure and host fleet drift.",
    target: "agency.example.gov",
    cadence: "Monthly",
    nextRun: "2026-05-01T08:00:00Z",
    alertThreshold: "Readiness drop ≥5 pts",
    readinessScore: 47.5,
    readinessDelta: -5.1,
    newQuantumVulnerableCount: 3,
    certExpiringCount: 4,
    livePulse: { lastScanAgo: "1d ago", schedulerStatus: "healthy", unreadAlerts: 4 },
    evidenceFreshness: {
      lastSignedReport: "1 day ago",
      verifyActive: true,
      vaultRetention: "24h for PEM uploads",
    },
    weeks: bankWeeks.map((w, i) => ({
      ...w,
      trendPoint: {
        ...w.trendPoint,
        scanId: `scan_g${i + 1}`,
        readinessScore: Math.max(42, w.trendPoint.readinessScore - 14),
      },
      diff: {
        ...w.diff,
        previousScanId: i > 0 ? `scan_g${i}` : w.diff.previousScanId,
        summary:
          i === 7
            ? "Host fleet scan found 3 new RSA SSH keys and NSM-10 deadline findings increased."
            : w.diff.summary,
        currentReadinessScore: Math.max(42, (w.diff.currentReadinessScore ?? 58) - 14),
        previousReadinessScore: Math.max(42, (w.diff.previousReadinessScore ?? 58) - 14),
        newQuantumVulnerableCount: i === 7 ? 3 : w.diff.newQuantumVulnerableCount,
      },
    })),
    driftBySource: {
      external: { added: 2, removed: 0 },
      host: { added: 11, removed: 3 },
      code: { added: 4, removed: 0 },
      cbom: { added: 2, removed: 1 },
    },
    commandCenter: {
      businessUnits: { "Public web": 52, "Internal apps": 44, "Host fleet": 41, "PKI/CAs": 38 },
      deltas: { "Public web": -2, "Internal apps": -4, "Host fleet": -8, "PKI/CAs": -3 },
    },
    digest: {
      headline: "NSM-10 tier-1 findings up — host fleet drift requires immediate triage",
      wins: ["Public web TLS held above 50", "CNSA 2.0 roadmap published internally"],
      risks: ["11 new host findings since last fleet scan", "PKI/CAs BU at 38 readiness"],
      nextWeekFocus: ["Rotate RSA SSH host keys on DMZ fleet", "Map findings to NSM-10 tiers"],
      sinceLastBoardMeeting: "FedRAMP-style evidence pack due in 6 weeks",
      topCryptoRisks: ["RSA SSH host keys on edge servers", "Classical CA hierarchy"],
      narrative: "Illustrative government scenario — not an attestation.",
    },
    forecast: { current: 47.5, projected: 42.0, slope: -2.8 },
    severitySlices: [
      { label: "Critical", value: 5, color: "#f87171" },
      { label: "High", value: 9, color: "#fb923c" },
      { label: "Medium", value: 14, color: "#fbbf24" },
      { label: "Low", value: 8, color: "#94a3b8" },
    ],
    algorithmRows: [
      { label: "RSA-2048", count: 22 },
      { label: "RSA SSH", count: 15 },
      { label: "ECDSA P-384", count: 5 },
      { label: "ML-DSA", count: 0 },
    ],
    remediationVelocity: [
      { week: "W1", open: 32, closed: 1 },
      { week: "W2", open: 31, closed: 2 },
      { week: "W3", open: 30, closed: 1 },
      { week: "W4", open: 29, closed: 3 },
      { week: "W5", open: 31, closed: 1 },
      { week: "W6", open: 33, closed: 0 },
      { week: "W7", open: 32, closed: 2 },
      { week: "W8", open: 36, closed: 1 },
    ],
    peerBenchmark: {
      yourScore: 47.5,
      median: 49,
      p25: 41,
      p75: 56,
      sampleSize: 203,
      industry: "government",
    },
    portfolioChildren: [
      { name: "Agency HQ", readiness: 47.5, openAlerts: 4, tier: "monitor" },
      { name: "Field Office East", readiness: 41, openAlerts: 6, tier: "monitor" },
      { name: "Field Office West", readiness: 52, openAlerts: 2, tier: "assess" },
    ],
    slackMessage: "Qtangl: Host fleet drift — 3 new Q-vulnerable SSH keys on agency.example.gov",
    teamsMessage:
      "Qtangl Monitor — Government tenant readiness 47.5. NSM-10 findings increased. Host fleet review required.",
    webhook: {
      schemaVersion: "qtangl-webhook-v2",
      event: "scan.complete",
      tenantId: "tenant-gov-demo",
      scanId: "scan_2026_04_08_gov",
      targetDomain: "agency.example.gov",
      readinessScore: 47.5,
      readinessBand: "at_risk",
      verifyUrl: "https://www.qtangl.com/verify?scanId=scan_2026_04_08_gov",
      evidenceZipUrl: "https://api.qtangl.com/tenant/scans/scan_2026_04_08_gov/report?format=bundle",
      message: "Host fleet scan: 3 new quantum-vulnerable SSH keys",
      alerts: [
        {
          severity: "high",
          code: "new_quantum_vulnerable",
          message: "3 new quantum-vulnerable host keys since last scan",
        },
        {
          severity: "high",
          code: "readiness_drop",
          message: "Readiness score dropped 5.1 points (52.6 → 47.5)",
        },
      ],
      scanDiff: {
        previousScanId: "scan_2026_03_01_gov",
        readinessDelta: -5.1,
        newQuantumVulnerableCount: 3,
        certExpiringCount: 4,
      },
      topFindings: [
        { label: "edge-01.agency.example.gov:22", severity: "high" },
        { label: "edge-02.agency.example.gov:22", severity: "high" },
        { label: "pki.agency.example.gov:443", severity: "medium" },
      ],
    },
  },
};

export const monitorScenarioList = Object.values(monitorScenarios);

export function getMonitorScenario(id: MonitorScenarioId): MonitorScenarioBundle {
  return monitorScenarios[id];
}

// Backward-compatible exports for existing tests/components
export const monitorPreviewDiff = bankWeeks[7]!.diff;
export const monitorPreviewTrend = bankWeeks.map((w) => w.trendPoint);
export const monitorPreviewSchedule = {
  target: monitorScenarios.bank.target,
  cadence: monitorScenarios.bank.cadence,
  nextRun: monitorScenarios.bank.nextRun,
  notifyEmail: "ciso@example.com",
  alertThreshold: monitorScenarios.bank.alertThreshold,
};
export const monitorPreviewWebhookV2 = monitorScenarios.bank.webhook;
export const monitorPreviewSlackMessage = monitorScenarios.bank.slackMessage;
