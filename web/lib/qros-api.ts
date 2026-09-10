import { fetchDashboardJson } from "@/lib/dashboard-bff";
import type {
  GlobalLens,
  MarketplaceTile,
  MorningBriefing,
  NextBestAction,
  RunwayData,
} from "@/lib/qros-types";

export async function fetchNextActions(): Promise<NextBestAction[]> {
  const payload = await fetchDashboardJson<{ actions: NextBestAction[] }>("/tenant/qros/next-actions");
  return payload.actions ?? [];
}

export async function fetchMorningBriefing(persona: string): Promise<MorningBriefing> {
  return fetchDashboardJson<MorningBriefing>(
    `/tenant/qros/morning-briefing?persona=${encodeURIComponent(persona)}`
  );
}

export async function fetchRunway(): Promise<RunwayData> {
  return fetchDashboardJson<RunwayData>("/tenant/qros/runway");
}

export async function simulateScenario(scenarioId: string) {
  return fetchDashboardJson<{ scenarioId: string; projectedReadiness: number; confidenceBand: { low: number; high: number }; assumptions: string[] }>(
    "/tenant/qros/scenario/simulate",
    { method: "POST", body: JSON.stringify({ scenarioId }) }
  );
}

export async function fetchDigitalTwin(scanId: string, selectedNodeId?: string | null) {
  const q = selectedNodeId ? `?selectedNodeId=${encodeURIComponent(selectedNodeId)}` : "";
  return fetchDashboardJson<{ graph: Record<string, unknown>; blastRadius: string[]; simulationNote: string }>(
    `/tenant/qros/digital-twin/${encodeURIComponent(scanId)}${q}`
  );
}

export async function exportBoardDeck() {
  return fetchDashboardJson<{ title: string; slides: Array<{ title: string; body: string }>; formats: string[] }>(
    "/tenant/qros/board-deck",
    { method: "POST", body: JSON.stringify({}) }
  );
}

export async function executeAgenticAction(opts: {
  action: string;
  payload?: Record<string, unknown>;
  dryRun?: boolean;
  approved?: boolean;
}) {
  return fetchDashboardJson<{ status: string; steps: string[]; guardrails: string[]; result?: Record<string, unknown>; error?: string }>(
    "/tenant/qros/agentic/execute",
    {
      method: "POST",
      body: JSON.stringify({
        action: opts.action,
        payload: opts.payload ?? {},
        dryRun: opts.dryRun ?? true,
        approved: opts.approved ?? false,
      }),
    }
  );
}

export async function fetchMarketplaceTiles(): Promise<MarketplaceTile[]> {
  const payload = await fetchDashboardJson<{ tiles: MarketplaceTile[] }>("/tenant/qros/marketplace/tiles");
  return payload.tiles ?? [];
}

export async function configurePushBriefing(channels: string[], cadenceHours = 24) {
  return fetchDashboardJson<{ status: string }>("/tenant/qros/push-briefing", {
    method: "POST",
    body: JSON.stringify({ channels, cadenceHours }),
  });
}

export async function exportBoardDeckPdf(): Promise<Blob> {
  const response = await fetch("/api/dashboard/tenant/qros/board-deck?format=pdf", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error("PDF export failed");
  return response.blob();
}

export async function mutateNbaAction(actionId: string, op: "snooze" | "dismiss" | "assign", owner?: string) {
  return fetchDashboardJson<{ status: string }>(
    `/tenant/qros/next-actions/${encodeURIComponent(actionId)}/mutate`,
    { method: "POST", body: JSON.stringify({ op, owner }) }
  );
}

export async function installMarketplaceTile(tileId: string) {
  const payload = await fetchDashboardJson<{ tiles: MarketplaceTile[] }>(
    `/tenant/qros/marketplace/tiles/${encodeURIComponent(tileId)}/install`,
    { method: "POST", body: JSON.stringify({ tileId }) }
  );
  return payload.tiles ?? [];
}

export async function uninstallMarketplaceTile(tileId: string) {
  await fetchDashboardJson(`/tenant/qros/marketplace/tiles/${encodeURIComponent(tileId)}/install`, {
    method: "DELETE",
  });
}

export async function sendPushBriefingNow(channels: string[]) {
  return fetchDashboardJson<{ status: string; delivery?: { delivered: number } }>(
    "/tenant/qros/push-briefing/send",
    { method: "POST", body: JSON.stringify({ channels, cadenceHours: 24 }) }
  );
}

export function lensToQuery(lens: GlobalLens): string {
  const params = new URLSearchParams();
  if (lens.businessUnit) params.set("bu", lens.businessUnit);
  if (lens.framework) params.set("framework", lens.framework);
  if (lens.severity) params.set("severity", lens.severity);
  if (lens.environment) params.set("env", lens.environment);
  if (lens.query) params.set("q", lens.query);
  return params.toString();
}
