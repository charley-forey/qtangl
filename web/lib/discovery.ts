import { qtanglApiBaseUrl } from "@/lib/api";
import { fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";

type DiscoveryOptions = { useBff?: boolean; apiKey?: string };

async function discoveryFetch(path: string, options: RequestInit = {}, opts?: DiscoveryOptions) {
  const normalized = path.startsWith("/tenant/") ? path.slice("/tenant".length) : path;
  if (opts?.useBff) {
    const method = (options.method ?? "GET").toUpperCase();
    if (method === "GET") {
      return fetchDashboardJson(`/tenant${normalized}`);
    }
    if (method === "POST") {
      const body = options.body ? JSON.parse(String(options.body)) : undefined;
      return postDashboardJson(`/tenant${normalized}`, body ?? {});
    }
    throw new Error(`Unsupported discovery BFF method: ${method}`);
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (opts?.apiKey) headers.Authorization = `Bearer ${opts.apiKey}`;
  const res = await fetch(`${qtanglApiBaseUrl}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? res.statusText);
  }
  return res.json();
}

function discoveryOpts(apiKeyOrOpts?: string | DiscoveryOptions): DiscoveryOptions {
  if (typeof apiKeyOrOpts === "string") return { apiKey: apiKeyOrOpts };
  return apiKeyOrOpts ?? {};
}

export async function createFleet(apiKeyOrOpts: string | DiscoveryOptions, name: string) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch(
    "/tenant/discovery/fleets",
    { method: "POST", body: JSON.stringify({ name }) },
    opts
  );
}

export async function listFleets(apiKeyOrOpts: string | DiscoveryOptions) {
  return discoveryFetch("/tenant/discovery/fleets", {}, discoveryOpts(apiKeyOrOpts));
}

export async function rotateFleetToken(apiKeyOrOpts: string | DiscoveryOptions, fleetId: string) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch(
    `/tenant/discovery/fleets/${encodeURIComponent(fleetId)}/rotate-token`,
    { method: "POST" },
    opts
  );
}

export async function listAgents(apiKeyOrOpts: string | DiscoveryOptions, fleetId?: string) {
  const q = fleetId ? `?fleetId=${encodeURIComponent(fleetId)}` : "";
  return discoveryFetch(`/tenant/discovery/agents${q}`, {}, discoveryOpts(apiKeyOrOpts));
}

export type HostFindingDetail = {
  id: string;
  findingId: string;
  findingType: string;
  agentId: string;
  algorithm?: string | null;
  location?: string | null;
  hostname?: string | null;
  confidence?: string | null;
  keySize?: number | null;
  fingerprint?: string | null;
  ingestedAt?: string | null;
};

export async function listHostFindings(
  apiKeyOrOpts: string | DiscoveryOptions,
  agentId: string,
  opts?: { limit?: number; offset?: number }
) {
  const params = new URLSearchParams();
  if (opts?.limit != null) params.set("limit", String(opts.limit));
  if (opts?.offset != null) params.set("offset", String(opts.offset));
  const q = params.toString() ? `?${params.toString()}` : "";
  return discoveryFetch(`/tenant/discovery/agents/${encodeURIComponent(agentId)}/findings${q}`, {}, discoveryOpts(apiKeyOrOpts));
}

export async function getHostFinding(apiKeyOrOpts: string | DiscoveryOptions, findingId: string) {
  return discoveryFetch(`/tenant/discovery/findings/${encodeURIComponent(findingId)}`, {}, discoveryOpts(apiKeyOrOpts)) as Promise<{
    finding: HostFindingDetail;
    programItemId?: string | null;
  }>;
}

export async function revokeAgents(apiKeyOrOpts: string | DiscoveryOptions, agentIds: string[]) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch(
    "/tenant/discovery/agents/revoke",
    { method: "POST", body: JSON.stringify({ agentIds }) },
    opts
  );
}

export async function getDiscoverySummary(apiKeyOrOpts: string | DiscoveryOptions) {
  return discoveryFetch("/tenant/discovery/summary", {}, discoveryOpts(apiKeyOrOpts));
}

export async function triggerHostScan(apiKeyOrOpts: string | DiscoveryOptions, fleetId?: string) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch(
    "/tenant/discovery/host-scan",
    { method: "POST", body: JSON.stringify({ fleetId }) },
    opts
  );
}

export async function uploadOfflineFindings(apiKeyOrOpts: string | DiscoveryOptions, body: Record<string, unknown>) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch("/tenant/discovery/offline-upload", { method: "POST", body: JSON.stringify(body) }, opts);
}

export async function listCodeTargets(apiKeyOrOpts: string | DiscoveryOptions) {
  return discoveryFetch("/tenant/discovery/code-targets", {}, discoveryOpts(apiKeyOrOpts));
}

export async function listImageTargets(apiKeyOrOpts: string | DiscoveryOptions) {
  return discoveryFetch("/tenant/discovery/image-targets", {}, discoveryOpts(apiKeyOrOpts));
}

export async function triggerCodeScan(apiKeyOrOpts: string | DiscoveryOptions, body: Record<string, unknown>) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch("/tenant/coverage/code-scan", { method: "POST", body: JSON.stringify(body) }, opts);
}

export async function getDiscoveryJob(apiKeyOrOpts: string | DiscoveryOptions, jobId: string) {
  return discoveryFetch(`/tenant/discovery/jobs/${jobId}`, {}, discoveryOpts(apiKeyOrOpts));
}

export async function triggerBinaryScan(apiKeyOrOpts: string | DiscoveryOptions, imageRef: string) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch(
    "/tenant/discovery/binary-scan",
    { method: "POST", body: JSON.stringify({ imageRef }) },
    opts
  );
}

export async function getCmdbCoverage(apiKeyOrOpts: string | DiscoveryOptions) {
  return discoveryFetch("/tenant/discovery/cmdb-coverage", {}, discoveryOpts(apiKeyOrOpts));
}

export async function testRegistryConnection(
  apiKeyOrOpts: string | DiscoveryOptions,
  integrationId: string,
  imageRef: string
) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch(
    "/tenant/discovery/registry/test-connection",
    { method: "POST", body: JSON.stringify({ integrationId, imageRef }) },
    opts
  );
}

export async function getSourceRuntimeDiff(
  apiKeyOrOpts: string | DiscoveryOptions,
  sourceFindings: Record<string, unknown>[],
  runtimeFindings: Record<string, unknown>[]
) {
  const opts = discoveryOpts(apiKeyOrOpts);
  return discoveryFetch(
    "/tenant/discovery/source-runtime-diff",
    {
      method: "POST",
      body: JSON.stringify({ sourceFindings, runtimeFindings }),
    },
    opts
  );
}
