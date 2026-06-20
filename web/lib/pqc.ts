import { newIdempotencyKey } from "@qtangl/sdk";

import { fetchQtanglJson } from "@/lib/api";
import { createBffQtanglClient, createQtanglClient, createSandboxQtanglClient } from "@/lib/qtangl-client";

function resolveClient(apiKey?: string) {
  if (apiKey === "bff") {
    return createBffQtanglClient();
  }
  return apiKey ? createQtanglClient(apiKey) : createSandboxQtanglClient();
}

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

export async function getPqcInventory(apiKey?: string) {
  return resolveClient(apiKey).request<{ status: "success"; summary: string; inventory: CryptoAsset[] }>({
    method: "GET",
    path: "/pqc/inventory",
  });
}

export async function getPqcScenarios(apiKey?: string) {
  return resolveClient(apiKey).request<{ status: "success"; scenarios: Scenario[] }>({
    method: "GET",
    path: "/pqc/scenarios",
  });
}

export async function getPqcTarget(scenarioId: string, apiKey?: string) {
  return resolveClient(apiKey).request<{ status: "success"; target: ScanTarget; scenario: Scenario }>({
    method: "GET",
    path: `/pqc/target?scenarioId=${encodeURIComponent(scenarioId)}`,
  });
}

export async function getPqcHandshakeTrace(apiKey?: string) {
  return resolveClient(apiKey).request<{ status: "success"; trace: HandshakeProof }>({
    method: "GET",
    path: "/pqc/handshake-trace",
  });
}

export async function getPqcStandards(apiKey?: string) {
  return resolveClient(apiKey).request<{ status: "success"; standards: Record<string, unknown> }>({
    method: "GET",
    path: "/pqc/standards",
  });
}

export async function scanPqc(
  input: {
    scenarioId: string;
    useFixture?: boolean;
    target?: string;
    seed?: number;
    bundleSessionId?: string;
    depth?: "standard" | "lite";
    industry?: string;
  },
  options?: { idempotencyKey?: string; apiKey?: string }
) {
  const client = resolveClient(options?.apiKey);
  return client.scan(
    {
      scenarioId: input.scenarioId,
      useFixture: input.useFixture ?? true,
      target: input.target ?? null,
      seed: input.seed ?? 1234,
      bundleSessionId: input.bundleSessionId ?? null,
      depth: input.depth ?? "standard",
      industry: input.industry ?? null,
    },
    { idempotencyKey: options?.idempotencyKey ?? newIdempotencyKey() }
  ) as Promise<PqcScanResponse | PqcScanRunningResponse>;
}

export async function pollPqcScan(scanId: string, apiKey?: string) {
  return resolveClient(apiKey).getScan(scanId) as Promise<
    PqcScanResponse | PqcScanRunningResponse | PqcScanErrorResponse
  >;
}

export async function getReportAvailability(scanId: string, apiKey?: string) {
  return resolveClient(apiKey).reports.availability(scanId) as Promise<ReportAvailabilityResponse>;
}

export async function persistPqcScanBundle(scanId: string, bundle: PqcScanResponse, apiKey?: string) {
  return resolveClient(apiKey).reports.persistScanBundle(
    scanId,
    bundle as Record<string, unknown>
  ) as Promise<ReportAvailabilityResponse>;
}

/** Persist bundle server-side, then poll until reports are downloadable. */
export async function syncReportAfterScan(scanId: string, bundle: PqcScanResponse, apiKey?: string) {
  try {
    const persisted = await persistPqcScanBundle(scanId, bundle, apiKey);
    if (persisted.reportAvailable) {
      return persisted;
    }
  } catch {
    // Older API builds lack POST /pqc/scan/{id}/persist — fall through to availability polling.
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    const availability = await getReportAvailability(scanId, apiKey);
    if (availability.reportAvailable) {
      return availability;
    }
    if (
      availability.missingReason &&
      !["scan_running", "bundle_not_persisted", "bundle_missing"].includes(
        availability.missingReason
      )
    ) {
      return availability;
    }
  }

  return getReportAvailability(scanId, apiKey);
}

const LIVE_SCAN_POLL_MS = 1500;
const LIVE_SCAN_MAX_ATTEMPTS = 120;

export async function waitForPqcScan(
  scanId: string,
  onProgress?: (timeline: PqcScanRunningResponse["timeline"]) => void,
  apiKey?: string
): Promise<PqcScanResponse> {
  for (let attempt = 0; attempt < LIVE_SCAN_MAX_ATTEMPTS; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, LIVE_SCAN_POLL_MS));
    const polled = await pollPqcScan(scanId, apiKey);
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

export async function provePqcHandshake(useFixture = true, apiKey?: string) {
  return fetchQtanglJson<{ status: "success"; proof: HandshakeProof }>("/pqc/handshake/prove", {
    method: "POST",
    body: JSON.stringify({ useFixture }),
    apiKey,
  });
}

export async function uploadPqcBundle(file: File, apiKey?: string) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchQtanglJson<{
    status: "success";
    sessionId: string;
    summary: string;
    rowCount?: number;
    preview?: { algorithms: string[]; qVulnerable?: number };
  }>("/pqc/upload-bundle", { method: "POST", body: formData, skipJsonContentType: true, apiKey });
}

export type ReadinessIndexSnapshot = {
  available: boolean;
  reason?: string;
  industry?: string;
  medianReadiness?: number;
  p25?: number;
  p75?: number;
  sampleSize?: number;
  minCohort?: number;
  disclaimer?: string;
};

export async function getPqcIndex(industry = "financial", apiKey?: string) {
  return fetchQtanglJson<{ status: "success"; index: ReadinessIndexSnapshot }>(
    `/pqc/index?industry=${encodeURIComponent(industry)}`,
    { apiKey }
  );
}

export type RemediationProjection = {
  currentReadinessScore: number;
  projectedReadinessScore: number;
  delta: number;
  selectedCount: number;
  assumptions: string[];
};

export async function simulatePqcRemediation(scanId: string, remediationIds: string[], apiKey?: string) {
  return fetchQtanglJson<{ status: "success"; projection: RemediationProjection }>(
    `/pqc/scan/${encodeURIComponent(scanId)}/remediation/simulate`,
    { method: "POST", body: JSON.stringify({ remediationIds }), apiKey }
  );
}

export function compareToBenchmark(score: number, index: ReadinessIndexSnapshot) {
  if (!index.available || index.p25 == null || index.medianReadiness == null || index.p75 == null) {
    return { available: false as const, reason: index.reason ?? "insufficient_cohort" };
  }
  let band: "above_peers" | "within_band" | "below_peers" = "within_band";
  if (score > index.p75) band = "above_peers";
  else if (score < index.p25) band = "below_peers";
  return {
    available: true as const,
    band,
    yourScore: score,
    median: index.medianReadiness,
    p25: index.p25,
    p75: index.p75,
    sampleSize: index.sampleSize,
    delta: score - index.medianReadiness,
  };
}

export function pqcReportUrl(
  scanId: string,
  format: "json" | "csv" | "cbom" | "pdf" | "bundle" | "executive" | "board" | "auditor",
  apiKey?: string
) {
  return resolveClient(apiKey).pqcReportUrl(scanId, format);
}

export function pqcReportDownloadUrl(
  scanId: string,
  format: "json" | "csv" | "cbom" | "pdf" | "bundle" | "executive" | "board" | "auditor",
  apiKey?: string
) {
  return pqcReportUrl(scanId, format, apiKey);
}

export async function getAuthorizedDomains(apiKey: string) {
  return fetchQtanglJson<{ status: "success"; domains: string[] }>("/tenant/authorized-domains", {
    apiKey,
  });
}

export async function peekOnboardingToken(token: string) {
  const { qtanglApiBaseUrl } = await import("@/lib/api");
  const response = await fetch(
    `${qtanglApiBaseUrl}/public/onboarding-key/${encodeURIComponent(token)}?peek=true`
  );
  if (!response.ok) {
    throw new Error("Onboarding link invalid, expired, or already used.");
  }
  return response.json() as Promise<{
    status: string;
    tenantId: string;
    apiKey?: string;
    loginUrl?: string;
    dashboardUrl?: string;
    assessUrl?: string;
    email?: string;
    peek?: boolean;
  }>;
}

export async function redeemOnboardingToken(token: string) {
  const { qtanglApiBaseUrl } = await import("@/lib/api");
  const response = await fetch(`${qtanglApiBaseUrl}/public/onboarding-key/${encodeURIComponent(token)}`);
  if (!response.ok) {
    throw new Error("Onboarding link invalid, expired, or already used.");
  }
  return response.json() as Promise<{
    status: string;
    tenantId: string;
    apiKey?: string;
    loginUrl?: string;
    dashboardUrl: string;
    assessUrl?: string;
    email?: string;
  }>;
}
