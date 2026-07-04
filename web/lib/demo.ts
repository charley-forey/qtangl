import { fetchQtanglJson, qtanglApiBaseUrl } from "@/lib/api";

export type DemoPosture = "classical" | "hybrid" | "pqc";
export type DemoComplianceTarget = "nist-ir-8547" | "pci-dss" | "cmmc" | "general";

export type DemoResource = {
  id: string;
  label: string;
  kind: string;
  host: string;
  port: number | null;
  businessUnit: string;
  posture: DemoPosture;
  complianceTarget: DemoComplianceTarget;
  enabled: boolean;
  activeEvents: string[];
};

export type DemoSnapshot = {
  id: string;
  scanId: string;
  capturedAt?: string;
  readinessScore: number;
  readinessBand: string;
  severityCounts: Record<string, number>;
  hndlExposed: number;
  perResourceStatus: Array<Record<string, unknown>>;
  alerts: Array<Record<string, unknown>>;
  signature?: Record<string, unknown>;
  narration?: string;
  sceneId?: string | null;
  campaignId?: string | null;
};

export type DemoStatusResponse = {
  status: string;
  simulation: boolean;
  honestyNote: string;
  resources: DemoResource[];
  latestSnapshot: DemoSnapshot | null;
  cadenceSec: number;
  chaosEnabled: boolean;
};

export type DemoTrendPoint = {
  snapshotId: string;
  scanId: string;
  createdAt?: string;
  readinessScore: number;
  readinessBand?: string;
};

export type DemoScene = {
  id: string;
  title: string;
  description: string;
};

export type DemoGraphResponse = {
  status: string;
  scanId: string | null;
  nodes: Array<{
    id: string;
    label: string;
    kind: string;
    quantumVulnerable?: boolean;
    severity?: string;
  }>;
  edges: Array<{ source: string; target: string; kind?: string }>;
  truncated?: boolean;
};

function demoPath(path: string) {
  return `/demo${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchDemoStatus(): Promise<DemoStatusResponse> {
  return fetchQtanglJson<DemoStatusResponse>(demoPath("/status"), { skipJsonContentType: true });
}

export async function fetchDemoTrend(limit = 30): Promise<{ status: string; points: DemoTrendPoint[] }> {
  return fetchQtanglJson(`${demoPath("/trend")}?limit=${limit}`, { skipJsonContentType: true });
}

export async function fetchDemoResources(): Promise<{ status: string; resources: DemoResource[] }> {
  return fetchQtanglJson(demoPath("/resources"));
}

export async function patchDemoResource(
  resourceId: string,
  body: Partial<Pick<DemoResource, "posture" | "complianceTarget" | "enabled" | "label">> & {
    activeEvents?: string[];
  }
): Promise<{ status: string; resource: DemoResource; snapshot: DemoSnapshot }> {
  return fetchQtanglJson(demoPath(`/resources/${resourceId}`), {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function createDemoResource(body: {
  label: string;
  kind: string;
  host: string;
  port?: number | null;
  businessUnit?: string;
  posture?: DemoPosture;
  complianceTarget?: DemoComplianceTarget;
}): Promise<{ status: string; resource: DemoResource; snapshot: DemoSnapshot }> {
  return fetchQtanglJson(demoPath("/resources"), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function reassessDemo(): Promise<{ status: string; snapshot: DemoSnapshot }> {
  return fetchQtanglJson(demoPath("/reassess"), { method: "POST" });
}

export async function applyDemoScene(sceneId: string): Promise<{ status: string; scene: DemoScene; snapshot: DemoSnapshot }> {
  return fetchQtanglJson(demoPath(`/scene/${sceneId}`), { method: "POST" });
}

export async function fetchDemoScenes(): Promise<{ status: string; scenes: DemoScene[] }> {
  return fetchQtanglJson(demoPath("/scenes"), { skipJsonContentType: true });
}

export async function injectDemoEvent(
  eventType: string,
  resourceId?: string
): Promise<{ status: string; injection: Record<string, unknown>; snapshot: DemoSnapshot }> {
  return fetchQtanglJson(demoPath("/inject"), {
    method: "POST",
    body: JSON.stringify({ eventType, resourceId }),
  });
}

export async function setDemoChaos(enabled: boolean): Promise<{ status: string; chaosEnabled: boolean }> {
  return fetchQtanglJson(demoPath("/chaos"), {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}

export async function fetchDemoCompliance(): Promise<{
  status: string;
  frameworks: Array<{ framework: string; status: string; score: number; inScope: boolean }>;
  complianceSummary: Record<string, unknown>;
  honestyNotes: string[];
}> {
  return fetchQtanglJson(demoPath("/compliance"), { skipJsonContentType: true });
}

export async function fetchDemoPortfolio(): Promise<{
  status: string;
  units: Array<{ businessUnit: string; assetCount: number; readinessScore: number | null }>;
  overallReadiness: number | null;
  overallBand: string | null;
}> {
  return fetchQtanglJson(demoPath("/portfolio"), { skipJsonContentType: true });
}

export async function fetchDemoGraph(): Promise<DemoGraphResponse> {
  return fetchQtanglJson(demoPath("/graph"), { skipJsonContentType: true });
}

export async function fetchDemoNarration(): Promise<{ status: string; narration: string }> {
  return fetchQtanglJson(demoPath("/narration"), { skipJsonContentType: true });
}

export async function verifyDemoSnapshot(snapshotId: string): Promise<{
  status: string;
  valid?: boolean;
  contentHash?: string;
  simulation?: boolean;
}> {
  return fetchQtanglJson(demoPath(`/verify/${snapshotId}`), { skipJsonContentType: true });
}

export async function saveDemoCampaign(name: string, steps: Array<Record<string, unknown>>) {
  return fetchQtanglJson(demoPath("/campaign"), {
    method: "POST",
    body: JSON.stringify({ name, steps }),
  });
}

export async function playDemoCampaign(campaignId: string) {
  return fetchQtanglJson(demoPath(`/campaign/${campaignId}/play`), { method: "POST" });
}

export async function pauseDemoCampaign(campaignId: string) {
  return fetchQtanglJson(demoPath(`/campaign/${campaignId}/pause`), { method: "POST" });
}

export function demoEventsUrl() {
  return `${qtanglApiBaseUrl}/demo/events`;
}

export function trendToReadinessPoints(points: DemoTrendPoint[]) {
  return points.map((point) => ({
    scanId: point.scanId,
    createdAt: point.createdAt || new Date().toISOString(),
    readinessScore: point.readinessScore,
    readinessBand: point.readinessBand,
  }));
}

export function severityCountsToChartData(counts: Record<string, number>) {
  return Object.entries(counts).map(([severity, count]) => ({ severity, count }));
}
