import { fetchQtanglJson, qtanglApiBaseUrl, qtanglSandboxApiKey } from "@/lib/api";

export type Vulnerability = {
  algorithm: string;
  key_size: number | null;
  shor_logical_qubits: number | null;
  classical_security_bits: number | null;
  status: "broken" | "at-risk" | "safe" | "unknown";
  hndl_exposed: boolean;
  pqc_replacement: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  summary: string;
};

export type CryptoAsset = {
  id: string;
  kind: string;
  host: string;
  port: number | null;
  label: string;
  algorithm: string;
  key_size: number | null;
  vulnerability: Vulnerability;
  hndl_verdict: string;
  already_too_late: boolean;
  mosca_priority: number;
  standards_refs: string[];
  pqc_ready?: boolean;
  pqcReady?: boolean;
  negotiated_cipher?: string | null;
  negotiated_group?: string | null;
  tls_version?: string | null;
  metadata?: Record<string, unknown>;
};

export type ScanCoverageEntry = {
  host: string;
  port: number | null;
  kind: string;
  status: "unreachable" | "error" | "skipped";
  detail: string;
};

export type ScanTarget = {
  domain: string;
  ports: number[];
  persona: string;
  organization: string;
  mandate: string;
};

export type Scenario = {
  id: string;
  title: string;
  summary: string;
  target: ScanTarget;
  manual_baseline: {
    inventory_weeks: number;
    assets_found: number;
    quantum_vulnerable: number;
    readiness_score: number;
    summary: string;
  };
  fixture_asset_ids: string[];
};

export type ScoreboardColumn = {
  label: string;
  scan_wall_time_seconds: number;
  assets_discovered: number;
  quantum_vulnerable: number;
  hndl_exposed: number;
  readiness_score: number;
  remediation_coverage: number;
  audit_pack_available: boolean;
  summary: string;
  readiness_band?: string;
};

export type Scoreboard = {
  manual: ScoreboardColumn;
  qtangl: ScoreboardColumn;
};

export type RemediationItem = {
  id: string;
  asset_id: string;
  priority: number;
  title: string;
  action: string;
  pqc_algorithm: string;
  deadline: string;
  effort_days: number;
  severity: string;
  summary: string;
  standards_refs: string[];
};

export type HandshakeProof = {
  mode: "live" | "replayed" | "fixture";
  server: string;
  port: number;
  tls_version: string;
  hybrid_group: string;
  kem_algorithm: string;
  client_hello_hex: string;
  named_groups: string[];
  cipher_suites: string[];
  summary: string;
  captured_at: string;
  metadata: Record<string, unknown>;
};

export type MoscaAssessment = {
  data_shelf_life_years: number;
  migration_time_years: number;
  years_to_q_day: number;
  inequality_holds: boolean;
  summary: string;
};

export type TimelineEvent = {
  key: string;
  label: string;
  duration_ms: number;
  status: string;
};

export type ComplianceFramework = {
  id: string;
  name: string;
  relevance: string;
};

export type ComplianceControlTheme = {
  framework: string;
  controlRef: string;
  theme: string;
};

export type ComplianceGapFinding = {
  framework: string;
  asset?: string;
  finding: string;
  status: string;
};

export type ComplianceControlRow = {
  framework: string;
  ref: string;
  theme: string;
  status: string;
  assetId?: string;
  assetLabel?: string;
};

export type ComplianceSummary = {
  controlsAtRisk?: ComplianceControlRow[];
  controlsSatisfied?: ComplianceControlRow[];
  atRiskCount?: number;
  satisfiedCount?: number;
};

export type CompliancePack = {
  packId: string;
  title: string;
  mandate?: string;
  organization?: string;
  persona?: string;
  primaryFrameworks: ComplianceFramework[];
  controlThemes: ComplianceControlTheme[];
  mappedStandardsFromScan?: Array<Record<string, unknown>>;
  gapFindings?: ComplianceGapFinding[];
  complianceSummary?: ComplianceSummary;
};

export type PqcScanResponse = {
  status: "success";
  scanId: string;
  scenario: Scenario;
  assets: CryptoAsset[];
  remediationBacklog: RemediationItem[];
  scoreboard: Scoreboard;
  handshakeProof: HandshakeProof;
  report: Record<string, unknown> & {
    executiveSummary?: Record<string, unknown>;
    migrationRoadmap?: Array<{ label: string; deadline: string; severity?: string }>;
    assetExplanations?: Record<string, string>;
    compliancePack?: CompliancePack;
    complianceSummary?: ComplianceSummary;
  };
  mosca: MoscaAssessment;
  timeline: TimelineEvent[];
  details: Record<string, unknown>;
  scanCoverage?: ScanCoverageEntry[];
  readinessBand?: string;
  reportAvailable?: boolean;
  availableFormats?: string[];
  missingReason?: string | null;
  scanOutcome?: "assets_found" | "no_assets_found" | "partial_assets" | "target_unreachable" | "unknown";
};

export type PqcScanRunningResponse = {
  status: "running";
  scanId: string;
  summary?: string;
  timeline?: TimelineEvent[];
  reportAvailable?: boolean;
  availableFormats?: string[];
  missingReason?: string | null;
  scanOutcome?: "running";
};

export type PqcScanErrorResponse = {
  status: "error";
  scanId: string;
  message?: string;
  timeline?: TimelineEvent[];
  reportAvailable?: boolean;
  availableFormats?: string[];
  missingReason?: string | null;
  scanOutcome?: "failed";
};

export type ReportAvailabilityResponse = {
  status: "success";
  scanId: string;
  reportAvailable: boolean;
  availableFormats: string[];
  missingReason?: string | null;
};

export async function getPqcInventory() {
  return fetchQtanglJson<{ status: "success"; summary: string; inventory: CryptoAsset[] }>(
    "/pqc/inventory"
  );
}

export async function getPqcScenarios() {
  return fetchQtanglJson<{ status: "success"; scenarios: Scenario[] }>("/pqc/scenarios");
}

export async function getPqcTarget(scenarioId: string) {
  return fetchQtanglJson<{ status: "success"; target: ScanTarget; scenario: Scenario }>(
    `/pqc/target?scenarioId=${encodeURIComponent(scenarioId)}`
  );
}

export async function getPqcHandshakeTrace() {
  return fetchQtanglJson<{ status: "success"; trace: HandshakeProof }>("/pqc/handshake-trace");
}

export async function getPqcStandards() {
  return fetchQtanglJson<{ status: "success"; standards: Record<string, unknown> }>("/pqc/standards");
}

export async function scanPqc(input: {
  scenarioId: string;
  useFixture?: boolean;
  target?: string;
  seed?: number;
  bundleSessionId?: string;
  depth?: "standard" | "lite";
}) {
  return fetchQtanglJson<PqcScanResponse | PqcScanRunningResponse>("/pqc/scan", {
    method: "POST",
    body: JSON.stringify({
      scenarioId: input.scenarioId,
      useFixture: input.useFixture ?? true,
      target: input.target ?? null,
      seed: input.seed ?? 1234,
      bundleSessionId: input.bundleSessionId ?? null,
      depth: input.depth ?? "standard",
    }),
  });
}

export async function pollPqcScan(scanId: string) {
  return fetchQtanglJson<PqcScanResponse | PqcScanRunningResponse | PqcScanErrorResponse>(
    `/pqc/scan/${encodeURIComponent(scanId)}`
  );
}

export async function getReportAvailability(scanId: string) {
  return fetchQtanglJson<ReportAvailabilityResponse>(
    `/pqc/report/${encodeURIComponent(scanId)}/availability`
  );
}

const LIVE_SCAN_POLL_MS = 1500;
const LIVE_SCAN_MAX_ATTEMPTS = 120;

export async function waitForPqcScan(
  scanId: string,
  onProgress?: (timeline: PqcScanRunningResponse["timeline"]) => void
): Promise<PqcScanResponse> {
  for (let attempt = 0; attempt < LIVE_SCAN_MAX_ATTEMPTS; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, LIVE_SCAN_POLL_MS));
    const polled = await pollPqcScan(scanId);
    if (polled.status === "success") {
      return polled;
    }
    if (polled.status === "error") {
      throw new Error(polled.message ?? "Scan failed");
    }
    if (onProgress && polled.timeline?.length) {
      onProgress(polled.timeline);
    }
  }
  const minutes = Math.round((LIVE_SCAN_MAX_ATTEMPTS * LIVE_SCAN_POLL_MS) / 60_000);
  throw new Error(
    `Live scan timed out after ${minutes} minutes. The scan may still be running — retry from the dashboard or poll GET /pqc/scan/${scanId}.`
  );
}

export async function provePqcHandshake(useFixture = true) {
  return fetchQtanglJson<{ status: "success"; proof: HandshakeProof }>("/pqc/handshake/prove", {
    method: "POST",
    body: JSON.stringify({ useFixture }),
  });
}

export async function uploadPqcBundle(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchQtanglJson<{ status: "success"; sessionId: string; summary: string }>(
    "/pqc/upload-bundle",
    { method: "POST", body: formData, skipJsonContentType: true }
  );
}

export function pqcReportUrl(
  scanId: string,
  format: "json" | "csv" | "cbom" | "pdf" | "bundle" | "executive" | "board" | "auditor"
) {
  const params = new URLSearchParams({
    format,
    api_key: qtanglSandboxApiKey,
  });
  return `${qtanglApiBaseUrl}/pqc/report/${encodeURIComponent(scanId)}?${params.toString()}`;
}

export function pqcReportDownloadUrl(
  scanId: string,
  format: "json" | "csv" | "cbom" | "pdf" | "bundle" | "executive" | "board" | "auditor"
) {
  return pqcReportUrl(scanId, format);
}
