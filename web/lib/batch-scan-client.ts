import { fetchQtanglJson } from "@/lib/api";
import { fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";

export type BatchScanEntry = {
  scanId: string;
  target: string;
  status: string;
};

export type BatchLiveScanResult = {
  status: "success";
  count: number;
  summary: string;
  scans: BatchScanEntry[];
  schedules?: Array<{ id: string; target?: string | null }>;
  schedulesSkipped?: string[];
  scheduleSummary?: string;
};

export type BatchScheduleResult = {
  status: "success";
  count: number;
  summary: string;
  skipped: string[];
  schedules: Array<{ id: string; target?: string | null; cadenceHours?: number }>;
};

type BatchLiveScanInput = {
  domains: string[];
  industry?: string;
  depth?: "standard" | "lite";
  createSchedules?: boolean;
  scheduleCadenceHours?: number;
  notifyEmail?: string | null;
  skipExistingSchedules?: boolean;
  useBff?: boolean;
  apiKey?: string;
};

export async function startBatchLiveScan(input: BatchLiveScanInput): Promise<BatchLiveScanResult> {
  const body = {
    domains: input.domains,
    industry: input.industry,
    depth: input.depth ?? "standard",
    createSchedules: input.createSchedules ?? false,
    scheduleCadenceHours: input.scheduleCadenceHours ?? 168,
    notifyEmail: input.notifyEmail ?? null,
    skipExistingSchedules: input.skipExistingSchedules ?? true,
  };
  if (input.useBff) {
    return postDashboardJson<BatchLiveScanResult>("/tenant/scans/batch", body);
  }
  return fetchQtanglJson<BatchLiveScanResult>("/tenant/scans/batch", {
    method: "POST",
    body: JSON.stringify(body),
    apiKey: input.apiKey,
  });
}

export async function startBatchSchedules(
  input: {
    targets: string[];
    cadenceHours?: number;
    notifyEmail?: string | null;
    skipExisting?: boolean;
    useBff?: boolean;
    apiKey?: string;
  }
): Promise<BatchScheduleResult> {
  const body = {
    targets: input.targets,
    cadenceHours: input.cadenceHours ?? 168,
    notifyEmail: input.notifyEmail ?? null,
    skipExisting: input.skipExisting ?? true,
  };
  if (input.useBff) {
    return postDashboardJson<BatchScheduleResult>("/tenant/schedules/batch", body);
  }
  return fetchQtanglJson<BatchScheduleResult>("/tenant/schedules/batch", {
    method: "POST",
    body: JSON.stringify(body),
    apiKey: input.apiKey,
  });
}

export async function pollBatchScanStatuses(
  entries: BatchScanEntry[],
  options?: { useBff?: boolean; apiKey?: string }
): Promise<BatchScanEntry[]> {
  const payload = options?.useBff
    ? await fetchDashboardJson<{ scans?: Array<{ scanId: string; status: string }> }>("/tenant/scans?limit=100")
    : await fetchQtanglJson<{ scans?: Array<{ scanId: string; status: string }> }>("/tenant/scans?limit=100", {
        apiKey: options?.apiKey,
      });
  const byId = new Map((payload.scans ?? []).map((scan) => [scan.scanId, scan]));
  return entries.map((entry) => {
    const row = byId.get(entry.scanId);
    if (!row) return entry;
    return { ...entry, status: row.status === "done" ? "done" : row.status };
  });
}

export function batchScanPending(entries: BatchScanEntry[]): boolean {
  return entries.some((entry) => entry.status !== "done" && entry.status !== "failed");
}
