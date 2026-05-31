/** Minimal Qtangl PQC API client (TypeScript). */

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

  async scanFixture(scenarioId = "bank-tls-inventory"): Promise<{ scanId?: string }> {
    return this.post("/pqc/scan", { scenarioId, useFixture: true });
  }

  reportPdfUrl(scanId: string): string {
    const url = new URL(`${this.baseUrl}/pqc/report/${scanId}`);
    url.searchParams.set("format", "pdf");
    url.searchParams.set("api_key", this.apiKey);
    return url.toString();
  }

  async verify(scanId: string): Promise<Record<string, unknown>> {
    return this.get(`/pqc/verify/${scanId}`);
  }

  private async get(path: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}${path}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  private async post(path: string, body: unknown): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }
}
