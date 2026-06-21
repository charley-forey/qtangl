const DEFAULT_QTANGL_API_BASE_URL = "https://api.qtangl.com";

/** Ensures fetch gets an absolute URL (Vercel env is often pasted without https://). */
export function normalizeQtanglApiBaseUrl(raw?: string): string {
  const trimmed = (raw ?? DEFAULT_QTANGL_API_BASE_URL).trim();
  if (!trimmed) {
    return DEFAULT_QTANGL_API_BASE_URL;
  }
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withScheme.replace(/\/+$/, "");
}

export const qtanglApiBaseUrl = normalizeQtanglApiBaseUrl(
  process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL
);

export const qtanglSandboxApiKey =
  process.env.NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY ?? "<pilot-api-key>";

export function getQtanglHeaders(
  extraHeaders?: HeadersInit,
  includeJson = true,
  apiKey: string = qtanglSandboxApiKey
) {
  const headers = new Headers(extraHeaders);
  headers.set("Authorization", `Bearer ${apiKey}`);
  if (includeJson && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

export async function fetchQtanglJson<T>(
  path: string,
  init?: RequestInit & { skipJsonContentType?: boolean; apiKey?: string }
): Promise<T> {
  const { skipJsonContentType = false, headers, apiKey, ...rest } = init ?? {};
  const response = await fetch(`${qtanglApiBaseUrl}${path}`, {
    ...rest,
    headers: getQtanglHeaders(headers, !skipJsonContentType, apiKey ?? qtanglSandboxApiKey),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    let message = detail || `Qtangl request failed with ${response.status}`;
    try {
      const parsed = JSON.parse(detail) as {
        detail?: unknown;
        message?: string;
        code?: string;
      };
      const payload =
        typeof parsed.detail === "object" && parsed.detail !== null
          ? (parsed.detail as { message?: string; code?: string })
          : parsed;
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (typeof payload.code === "string") {
        message = JSON.stringify(payload);
      } else if (typeof parsed.detail === "string") {
        message = parsed.detail;
      } else if (typeof parsed.message === "string") {
        message = parsed.message;
      }
    } catch {
      // keep raw body
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}
