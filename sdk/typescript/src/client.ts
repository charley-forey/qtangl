import type { components } from "./generated/schema.js";
import { CbomResource, DriftResource, MonitorResource, RemediationResource, ReportResource } from "./resources.js";
import { requestJson, type TransportOptions } from "./transport.js";

export type QtanglClientOptions = TransportOptions;

export type ScanRequest = components["schemas"]["PqcScanRequest"];
export type ScheduleCreateRequest = components["schemas"]["ScheduleCreateRequest"];
export type SchedulePatchRequest = components["schemas"]["SchedulePatchRequest"];
export type TenantSettingsRequest = components["schemas"]["TenantSettingsRequest"];
export type CbomConflictResolveRequest = components["schemas"]["CbomConflictResolveRequest"];
export type RemediationUpdateRequest = components["schemas"]["RemediationUpdateRequest"];
export type ProgramCreateRequest = components["schemas"]["ProgramCreateRequest"];
export type ProgramUpdateRequest = components["schemas"]["ProgramUpdateRequest"];
export type ProgramVerifyRequest = components["schemas"]["ProgramVerifyRequest"];

export class QtanglClient {
  private readonly options: TransportOptions;
  readonly monitor: MonitorResource;
  readonly drift: DriftResource;
  readonly remediation: RemediationResource;
  readonly cbom: CbomResource;
  readonly reports: ReportResource;

  constructor(options: QtanglClientOptions) {
    this.options = options;
    this.monitor = new MonitorResource(options);
    this.drift = new DriftResource(options);
    this.remediation = new RemediationResource(options);
    this.cbom = new CbomResource(options);
    this.reports = new ReportResource(options);
  }

  healthReady(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/health/ready", auth: false });
  }

  scan(body: ScanRequest, options?: { idempotencyKey?: string }): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: "/pqc/scan",
      body,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  scanFixture(
    options?: { scenarioId?: string; idempotencyKey?: string }
  ): Promise<Record<string, unknown>> {
    return this.scan(
      {
        scenarioId: options?.scenarioId ?? "bank-tls-inventory",
        useFixture: true,
        target: "example.com",
        seed: 1234,
        depth: "standard",
      },
      { idempotencyKey: options?.idempotencyKey }
    );
  }

  getScan(scanId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: `/pqc/scan/${encodeURIComponent(scanId)}` });
  }

  async waitForScan(
    scanId: string,
    options?: { timeoutMs?: number; intervalMs?: number }
  ): Promise<Record<string, unknown>> {
    const timeoutMs = options?.timeoutMs ?? 300_000;
    const intervalMs = options?.intervalMs ?? 2_000;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const payload = await this.getScan(scanId);
      const status = payload.status;
      if (status === "success" || status === "failed" || status === "error") {
        return payload;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Scan ${scanId} did not complete within ${timeoutMs}ms`);
  }

  verifyScan(scanId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/pqc/verify/${encodeURIComponent(scanId)}`,
      auth: false,
    });
  }

  verifyReport(reportJson: Record<string, unknown>): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: "/pqc/verify",
      body: { reportJson },
      auth: false,
    });
  }

  transparencyRoot(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/pqc/transparency/root", auth: false });
  }

  transparencyKeys(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/pqc/transparency/keys", auth: false });
  }

  transparencyInclusion(contentHash: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/pqc/transparency/${encodeURIComponent(contentHash)}`,
      auth: false,
    });
  }

  listSchedules(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/schedules" });
  }

  createSchedule(
    body: ScheduleCreateRequest,
    options?: { idempotencyKey?: string }
  ): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: "/tenant/schedules",
      body,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  listScans(limit?: number): Promise<Record<string, unknown>> {
    const query = limit != null ? `?limit=${encodeURIComponent(String(limit))}` : "";
    return requestJson(this.options, { method: "GET", path: `/tenant/scans${query}` });
  }

  me(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/me" });
  }

  billingPortal(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/billing/portal" });
  }

  tenantReportUrl(
    scanId: string,
    format: "pdf" | "json" | "bundle" | "executive" | "board" | "auditor" = "pdf"
  ): string {
    const url = new URL(`${this.options.baseUrl.replace(/\/$/, "")}/tenant/scans/${scanId}/report`);
    url.searchParams.set("format", format);
    url.searchParams.set("api_key", this.options.apiKey);
    return url.toString();
  }

  pqcReportUrl(
    scanId: string,
    format: "json" | "csv" | "cbom" | "pdf" | "bundle" | "executive" | "board" | "auditor" = "pdf"
  ): string {
    const url = new URL(`${this.options.baseUrl.replace(/\/$/, "")}/pqc/report/${encodeURIComponent(scanId)}`);
    url.searchParams.set("format", format);
    url.searchParams.set("api_key", this.options.apiKey);
    return url.toString();
  }

  request<T = Record<string, unknown>>(options: {
    method: string;
    path: string;
    body?: unknown;
    auth?: boolean;
    idempotencyKey?: string;
  }): Promise<T> {
    return requestJson(this.options, options) as Promise<T>;
  }
}
