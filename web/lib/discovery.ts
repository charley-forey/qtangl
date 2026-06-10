const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function discoveryFetch(path: string, options: RequestInit = {}, apiKey?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? res.statusText);
  }
  return res.json();
}

export async function createFleet(apiKey: string, name: string) {
  return discoveryFetch(
    "/tenant/discovery/fleets",
    { method: "POST", body: JSON.stringify({ name }) },
    apiKey
  );
}

export async function listFleets(apiKey: string) {
  return discoveryFetch("/tenant/discovery/fleets", {}, apiKey);
}

export async function rotateFleetToken(apiKey: string, fleetId: string) {
  return discoveryFetch(
    `/tenant/discovery/fleets/${encodeURIComponent(fleetId)}/rotate-token`,
    { method: "POST" },
    apiKey
  );
}

export async function listAgents(apiKey: string, fleetId?: string) {
  const q = fleetId ? `?fleetId=${encodeURIComponent(fleetId)}` : "";
  return discoveryFetch(`/tenant/discovery/agents${q}`, {}, apiKey);
}

export async function revokeAgents(apiKey: string, agentIds: string[]) {
  return discoveryFetch(
    "/tenant/discovery/agents/revoke",
    { method: "POST", body: JSON.stringify({ agentIds }) },
    apiKey
  );
}

export async function getDiscoverySummary(apiKey: string) {
  return discoveryFetch("/tenant/discovery/summary", {}, apiKey);
}

export async function triggerHostScan(apiKey: string, fleetId?: string) {
  return discoveryFetch(
    "/tenant/discovery/host-scan",
    { method: "POST", body: JSON.stringify({ fleetId }) },
    apiKey
  );
}

export async function uploadOfflineFindings(apiKey: string, body: Record<string, unknown>) {
  return discoveryFetch("/tenant/discovery/offline-upload", { method: "POST", body: JSON.stringify(body) }, apiKey);
}

export async function listCodeTargets(apiKey: string) {
  return discoveryFetch("/tenant/discovery/code-targets", {}, apiKey);
}

export async function listImageTargets(apiKey: string) {
  return discoveryFetch("/tenant/discovery/image-targets", {}, apiKey);
}

export async function triggerCodeScan(apiKey: string, body: Record<string, unknown>) {
  return discoveryFetch("/tenant/coverage/code-scan", { method: "POST", body: JSON.stringify(body) }, apiKey);
}

export async function getDiscoveryJob(apiKey: string, jobId: string) {
  return discoveryFetch(`/tenant/discovery/jobs/${jobId}`, {}, apiKey);
}

export async function triggerBinaryScan(apiKey: string, imageRef: string) {
  return discoveryFetch(
    "/tenant/discovery/binary-scan",
    { method: "POST", body: JSON.stringify({ imageRef }) },
    apiKey
  );
}

export async function getCmdbCoverage(apiKey: string) {
  return discoveryFetch("/tenant/discovery/cmdb-coverage", {}, apiKey);
}

export async function testRegistryConnection(apiKey: string, integrationId: string, imageRef: string) {
  return discoveryFetch(
    "/tenant/discovery/registry/test-connection",
    { method: "POST", body: JSON.stringify({ integrationId, imageRef }) },
    apiKey
  );
}

export async function getSourceRuntimeDiff(
  apiKey: string,
  sourceFindings: Record<string, unknown>[],
  runtimeFindings: Record<string, unknown>[]
) {
  return discoveryFetch(
    "/tenant/discovery/source-runtime-diff",
    {
      method: "POST",
      body: JSON.stringify({ sourceFindings, runtimeFindings }),
    },
    apiKey
  );
}
