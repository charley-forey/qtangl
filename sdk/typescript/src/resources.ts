import type { components } from "./generated/schema.js";
import { requestJson, type TransportOptions } from "./transport.js";

export type SchedulePatchRequest = components["schemas"]["SchedulePatchRequest"];
export type TenantSettingsRequest = components["schemas"]["TenantSettingsRequest"];
export type CbomConflictResolveRequest = components["schemas"]["CbomConflictResolveRequest"];
export type RemediationUpdateRequest = components["schemas"]["RemediationUpdateRequest"];
export type ProgramCreateRequest = components["schemas"]["ProgramCreateRequest"];
export type ProgramUpdateRequest = components["schemas"]["ProgramUpdateRequest"];
export type ProgramVerifyRequest = components["schemas"]["ProgramVerifyRequest"];

function normalizeEvents(events?: string | string[]): string | undefined {
  if (events == null) {
    return undefined;
  }
  return Array.isArray(events) ? events.join(",") : events;
}

export class MonitorResource {
  constructor(private readonly options: TransportOptions) {}

  getSettings(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/settings" });
  }

  updateSettings(body: TenantSettingsRequest): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "PUT", path: "/tenant/settings", body });
  }

  listIntegrations(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/integrations" });
  }

  saveIntegration(provider: string, config: Record<string, unknown>): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/tenant/integrations/${encodeURIComponent(provider)}`,
      body: { config },
    });
  }

  listWebhooks(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/webhooks" });
  }

  createWebhook(body: { url: string; events?: string | string[] }): Promise<Record<string, unknown>> {
    const events = normalizeEvents(body.events);
    return requestJson(this.options, {
      method: "POST",
      path: "/tenant/webhooks",
      body: { url: body.url, ...(events ? { events } : {}) },
    });
  }

  deleteWebhook(webhookId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "DELETE",
      path: `/tenant/webhooks/${encodeURIComponent(webhookId)}`,
    });
  }

  listWebhookDlq(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/webhooks/dlq" });
  }

  replayWebhook(deadLetterId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: "/tenant/webhooks/replay",
      body: { deadLetterId },
    });
  }

  patchSchedule(scheduleId: string, body: SchedulePatchRequest): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "PATCH",
      path: `/tenant/schedules/${encodeURIComponent(scheduleId)}`,
      body,
    });
  }

  deleteSchedule(scheduleId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "DELETE",
      path: `/tenant/schedules/${encodeURIComponent(scheduleId)}`,
    });
  }

  scheduleRuns(scheduleId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/tenant/schedules/${encodeURIComponent(scheduleId)}/runs`,
    });
  }
}

export class DriftResource {
  constructor(private readonly options: TransportOptions) {}

  summary(sinceDays = 7): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/tenant/drift/summary?since_days=${sinceDays}`,
    });
  }

  scope(sourceType: string, scopeKey: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/tenant/drift/${encodeURIComponent(sourceType)}/${encodeURIComponent(scopeKey)}`,
    });
  }

  history(options?: { sourceType?: string; limit?: number }): Promise<Record<string, unknown>> {
    const params = new URLSearchParams({ limit: String(options?.limit ?? 50) });
    if (options?.sourceType) {
      params.set("source_type", options.sourceType);
    }
    return requestJson(this.options, { method: "GET", path: `/tenant/drift/history?${params.toString()}` });
  }

  intel(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/drift-intel" });
  }
}

export class RemediationResource {
  constructor(private readonly options: TransportOptions) {}

  listForScan(scanId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/tenant/scans/${encodeURIComponent(scanId)}/remediation`,
    });
  }

  upsertForScan(scanId: string, body: RemediationUpdateRequest): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/tenant/scans/${encodeURIComponent(scanId)}/remediation`,
      body,
    });
  }

  verifyForScan(
    scanId: string,
    body: { remediationId: string; verifyScanId: string }
  ): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/tenant/scans/${encodeURIComponent(scanId)}/remediation/verify`,
      body,
    });
  }

  intelligence(scanId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/tenant/scans/${encodeURIComponent(scanId)}/remediation/intelligence`,
    });
  }

  simulateForScan(scanId: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/tenant/scans/${encodeURIComponent(scanId)}/remediation/simulate`,
      body,
    });
  }

  automateForScan(scanId: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/tenant/scans/${encodeURIComponent(scanId)}/remediation/automate`,
      body,
    });
  }

  listProgram(options?: { status?: string; limit?: number; offset?: number }): Promise<Record<string, unknown>> {
    const params = new URLSearchParams({
      limit: String(options?.limit ?? 100),
      offset: String(options?.offset ?? 0),
    });
    if (options?.status) {
      params.set("status", options.status);
    }
    return requestJson(this.options, { method: "GET", path: `/tenant/remediation/program?${params.toString()}` });
  }

  createProgram(body: ProgramCreateRequest): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "POST", path: "/tenant/remediation/program", body });
  }

  programVelocity(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/tenant/remediation/program/velocity" });
  }

  simulateProgram(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "POST", path: "/tenant/remediation/program/simulate", body });
  }

  updateProgram(itemId: string, body: ProgramUpdateRequest): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "PUT",
      path: `/tenant/remediation/program/${encodeURIComponent(itemId)}`,
      body,
    });
  }

  programPlaybook(itemId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/tenant/remediation/program/${encodeURIComponent(itemId)}/playbook`,
    });
  }

  verifyProgram(itemId: string, body: ProgramVerifyRequest = {}): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/tenant/remediation/program/${encodeURIComponent(itemId)}/verify`,
      body,
    });
  }

  flipDryRun(programItemId: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/tenant/remediation/program/${encodeURIComponent(programItemId)}/flip/dry-run`,
      body,
    });
  }

  flip(programItemId: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/tenant/remediation/program/${encodeURIComponent(programItemId)}/flip`,
      body,
    });
  }
}

export class CbomResource {
  constructor(private readonly options: TransportOptions) {}

  ingest(
    body: {
      document: Record<string, unknown>;
      sourceLabel?: string;
      verificationStatus?: string;
    },
    options?: { idempotencyKey?: string }
  ): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: "/pqc/cbom/ingest",
      body: {
        verificationStatus: "unverified-source",
        ...body,
      },
      idempotencyKey: options?.idempotencyKey,
    });
  }

  aggregate(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/pqc/cbom/aggregate" });
  }

  sources(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/pqc/cbom/sources" });
  }

  conflicts(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/pqc/cbom/conflicts" });
  }

  diff(): Promise<Record<string, unknown>> {
    return requestJson(this.options, { method: "GET", path: "/pqc/cbom/diff" });
  }

  resolveConflict(conflictId: string, body: CbomConflictResolveRequest): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "PUT",
      path: `/pqc/cbom/conflicts/${encodeURIComponent(conflictId)}`,
      body,
    });
  }
}

export class ReportResource {
  constructor(private readonly options: TransportOptions) {}

  availability(scanId: string): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "GET",
      path: `/pqc/report/${encodeURIComponent(scanId)}/availability`,
    });
  }

  persistScanBundle(scanId: string, bundle: Record<string, unknown>): Promise<Record<string, unknown>> {
    return requestJson(this.options, {
      method: "POST",
      path: `/pqc/scan/${encodeURIComponent(scanId)}/persist`,
      body: bundle,
    });
  }
}
