const DEFAULT_QTANGL_API_BASE_URL =
  "https://sparkling-vibrancy-production-1a7a.up.railway.app";

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

export function getQtanglHeaders(extraHeaders?: HeadersInit, includeJson = true) {
  const headers = new Headers(extraHeaders);
  headers.set("Authorization", `Bearer ${qtanglSandboxApiKey}`);
  if (includeJson && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

export async function fetchQtanglJson<T>(
  path: string,
  init?: RequestInit & { skipJsonContentType?: boolean }
): Promise<T> {
  const { skipJsonContentType = false, headers, ...rest } = init ?? {};
  const response = await fetch(`${qtanglApiBaseUrl}${path}`, {
    ...rest,
    headers: getQtanglHeaders(headers, !skipJsonContentType),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Qtangl request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}
