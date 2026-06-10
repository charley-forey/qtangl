/** Qtangl PQC API client (TypeScript). */

export type QtanglClientOptions = {
  baseUrl: string;
  apiKey: string;
};

export class QtanglClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(options: QtanglClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
  }

  async healthReady(): Promise<Record<string, unknown>> {
    return this.get("/health/ready");
  }

  async me(): Promise<Record<string, unknown>> {
    return this.get("/tenant/me");
  }

  async scan(
    target: string,
    scenarioId = "bank-tls-inventory",
    useFixture = false
  ): Promise<Record<string, unknown>> {
    return this.post("/pqc/scan", { target, scenarioId, useFixture });
  }

  async scanFixture(scenarioId = "bank-tls-inventory"): Promise<Record<string, unknown>> {
    return this.scan("example.com", scenarioId, true);
  }

  async listSchedules(): Promise<Record<string, unknown>> {
    return this.get("/tenant/schedules");
  }

  async createSchedule(body: {
    target: string;
    cadenceHours?: number;
    notifyEmail?: string;
  }): Promise<Record<string, unknown>> {
    return this.post("/tenant/schedules", {
      scenarioId: "bank-tls-inventory",
      cadenceHours: body.cadenceHours ?? 168,
      target: body.target,
      notifyEmail: body.notifyEmail,
    });
  }

  async getSettings(): Promise<Record<string, unknown>> {
    return this.get("/tenant/settings");
  }

  reportPdfUrl(scanId: string): string {
    const url = new URL(`${this.baseUrl}/tenant/scans/${scanId}/report`);
    url.searchParams.set("format", "pdf");
    url.searchParams.set("api_key", this.apiKey);
    return url.toString();
  }

  async verify(scanId: string): Promise<Record<string, unknown>> {
    return this.get(`/pqc/verify/${scanId}`);
  }

  async listRemediation(scanId: string): Promise<Record<string, unknown>> {
    return this.get(`/tenant/scans/${scanId}/remediation`);
  }

  async upsertRemediation(
    scanId: string,
    body: { remediationId: string; status: string; owner?: string }
  ): Promise<Record<string, unknown>> {
    return this.post(`/tenant/scans/${scanId}/remediation`, body);
  }

  async getDriftSummary(sinceDays = 7): Promise<Record<string, unknown>> {
    return this.get(`/tenant/drift/summary?since_days=${sinceDays}`);
  }

  async getDriftScope(sourceType: string, scopeKey: string): Promise<Record<string, unknown>> {
    return this.get(`/tenant/drift/${encodeURIComponent(sourceType)}/${encodeURIComponent(scopeKey)}`);
  }

  async listRemediationProgram(status?: string): Promise<Record<string, unknown>> {
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.get(`/tenant/remediation/program${q}`);
  }

  async dryRunFlip(
    programItemId: string,
    body: { flipSurface: string; provider: string; targetEnv?: string; request?: Record<string, unknown> }
  ): Promise<Record<string, unknown>> {
    return this.post(`/tenant/remediation/program/${programItemId}/flip/dry-run`, body);
  }

  async submitFlip(
    programItemId: string,
    body: { flipSurface: string; provider: string; targetEnv?: string; request?: Record<string, unknown>; skipApproval?: boolean }
  ): Promise<Record<string, unknown>> {
    return this.post(`/tenant/remediation/program/${programItemId}/flip`, body);
  }

  async approveFlip(jobId: string, body: { approvalNote?: string; childTenantId?: string } = {}): Promise<Record<string, unknown>> {
    return this.post(`/tenant/flips/${jobId}/approve`, body);
  }

  async getFlipJob(jobId: string): Promise<Record<string, unknown>> {
    return this.get(`/tenant/flips/${jobId}`);
  }

  async verifyRemediation(
    scanId: string,
    body: { remediationId: string; verifyScanId: string }
  ): Promise<Record<string, unknown>> {
    return this.post(`/tenant/scans/${scanId}/remediation/verify`, body);
  }

  async createWebhook(url: string): Promise<Record<string, unknown>> {
    return this.post("/tenant/webhooks", { url });
  }

  async billingPortal(): Promise<Record<string, unknown>> {
    return this.get("/tenant/billing/portal");
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private async get(path: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  private async post(path: string, body: unknown): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }
}
