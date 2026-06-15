export class QtanglApiError extends Error {
  readonly status: number;
  readonly requestId?: string;
  readonly detail?: unknown;

  constructor(status: number, message: string, options?: { requestId?: string; detail?: unknown }) {
    super(message);
    this.name = "QtanglApiError";
    this.status = status;
    this.requestId = options?.requestId;
    this.detail = options?.detail;
  }
}

export type TransportOptions = {
  baseUrl: string;
  apiKey: string;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
};

export type RequestOptions = {
  method: string;
  path: string;
  body?: unknown;
  auth?: boolean;
  idempotencyKey?: string;
  requestId?: string;
};

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requestJson(
  options: TransportOptions,
  req: RequestOptions
): Promise<Record<string, unknown>> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const maxRetries = options.maxRetries ?? 3;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (req.auth !== false) {
    headers.Authorization = `Bearer ${options.apiKey}`;
  }
  if (req.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (req.idempotencyKey) {
    headers["Idempotency-Key"] = req.idempotencyKey;
  }
  headers["X-Request-Id"] = req.requestId ?? crypto.randomUUID();

  let attempt = 0;
  while (true) {
    const response = await fetchImpl(`${baseUrl}${req.path}`, {
      method: req.method,
      headers,
      body: req.body === undefined ? undefined : JSON.stringify(req.body),
      cache: "no-store",
    });

    if (response.status < 400 || !RETRYABLE.has(response.status) || attempt >= maxRetries) {
      const requestId = response.headers.get("X-Request-Id") ?? undefined;
      if (!response.ok) {
        const text = await response.text();
        let detail: unknown = text;
        try {
          detail = JSON.parse(text);
        } catch {
          /* keep text */
        }
        const message =
          typeof detail === "object" && detail && "detail" in detail
            ? String((detail as { detail: unknown }).detail)
            : text || `HTTP ${response.status}`;
        throw new QtanglApiError(response.status, message, { requestId, detail });
      }
      if (response.status === 204) {
        return {};
      }
      return (await response.json()) as Record<string, unknown>;
    }

    const delay = Math.min(2 ** attempt, 8) * 1000 + Math.random() * 250;
    await sleep(delay);
    attempt += 1;
  }
}
