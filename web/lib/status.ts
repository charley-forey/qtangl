import { qtanglApiBaseUrl } from "@/lib/api";

export type PlatformState = "operational" | "degraded" | "outage";

export type HealthReadyPayload = {
  status?: string;
  database?: boolean;
  redis?: boolean;
  persistenceEnabled?: boolean;
  redisEnabled?: boolean;
  schedulerStale?: boolean;
};

export type PlatformStatusSnapshot = {
  apiBaseUrl: string;
  checkedAt: string;
  overall: PlatformState;
  basic: {
    ok: boolean;
    status: string | null;
    error: string | null;
  };
  ready: {
    ok: boolean;
    status: string | null;
    database: boolean | null;
    redis: boolean | null;
    persistenceEnabled: boolean | null;
    redisEnabled: boolean | null;
    schedulerStale: boolean | null;
    error: string | null;
  };
};

async function fetchHealthJson<T>(path: string): Promise<T> {
  const response = await fetch(`${qtanglApiBaseUrl}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

function resolveOverall(
  basicOk: boolean,
  readyOk: boolean,
  readyStatus: string | null,
  schedulerStale: boolean | null
): PlatformState {
  if (!basicOk) {
    return "outage";
  }

  if (!readyOk || readyStatus !== "ready" || schedulerStale) {
    return "degraded";
  }

  return "operational";
}

export async function getPlatformStatus(): Promise<PlatformStatusSnapshot> {
  const checkedAt = new Date().toISOString();
  let basicOk = false;
  let basicStatus: string | null = null;
  let basicError: string | null = null;

  try {
    const payload = await fetchHealthJson<{ status?: string }>("/health");
    basicStatus = payload.status ?? null;
    basicOk = basicStatus === "ok";
  } catch (error) {
    basicError = error instanceof Error ? error.message : "Unable to reach API";
  }

  let readyOk = false;
  let readyStatus: string | null = null;
  let readyError: string | null = null;
  let database: boolean | null = null;
  let redis: boolean | null = null;
  let persistenceEnabled: boolean | null = null;
  let redisEnabled: boolean | null = null;
  let schedulerStale: boolean | null = null;

  try {
    const payload = await fetchHealthJson<HealthReadyPayload>("/health/ready");
    readyStatus = payload.status ?? null;
    database = payload.database ?? null;
    redis = payload.redis ?? null;
    persistenceEnabled = payload.persistenceEnabled ?? null;
    redisEnabled = payload.redisEnabled ?? null;
    schedulerStale = payload.schedulerStale ?? null;
    readyOk = true;
  } catch (error) {
    readyError = error instanceof Error ? error.message : "Unable to reach readiness probe";
  }

  return {
    apiBaseUrl: qtanglApiBaseUrl,
    checkedAt,
    overall: resolveOverall(basicOk, readyOk, readyStatus, schedulerStale),
    basic: {
      ok: basicOk,
      status: basicStatus,
      error: basicError,
    },
    ready: {
      ok: readyOk,
      status: readyStatus,
      database,
      redis,
      persistenceEnabled,
      redisEnabled,
      schedulerStale,
      error: readyError,
    },
  };
}

export const platformStatusCopy = {
  metadata: {
    title: "System status",
    description:
      "Live availability for the Qtangl API, persistence layer, and Monitor scheduler.",
  },
  hero: {
    eyebrow: "Status",
    title: "Qtangl platform status",
    description:
      "Live checks against our public health endpoints. Subscribe to updates by requesting Monitor access or contacting us directly.",
  },
  labels: {
    operational: "All systems operational",
    degraded: "Partial degradation",
    outage: "Service disruption",
    checkedAt: "Last checked",
    website: "Website",
    api: "API",
    platform: "Platform readiness",
    database: "Database",
    redis: "Redis queue",
    scheduler: "Monitor scheduler",
    operationalDetail: "Responding normally",
    degradedDetail: "Degraded or stale",
    outageDetail: "Unavailable",
    notConfigured: "Not enabled in this deployment",
    staleScheduler: "Scheduler tick is stale — scans may be delayed",
    docs: "Health API docs",
    trust: "Trust center",
    access: "Report an issue",
  },
} as const;
