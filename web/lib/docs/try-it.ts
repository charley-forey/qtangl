import type { DocsEndpoint } from "@/lib/docs/types";

const DOCS_API_KEY_STORAGE = "qtangl-docs-api-key";

export { DOCS_API_KEY_STORAGE };

function endpointUsesMultipart(endpoint: DocsEndpoint): boolean {
  return (
    endpoint.requestFields?.some((field) => field.type.toLowerCase().includes("multipart")) ??
    false
  );
}

function methodSupportsTryIt(method: DocsEndpoint["method"]): boolean {
  return method === "GET" || method === "POST";
}

/** Resolved path + query for code samples and live try-it (no unresolved `{param}` segments). */
export function resolveDocsRequestPath(endpoint: DocsEndpoint): string | null {
  if (endpoint.tryIt === false) return null;
  if (!methodSupportsTryIt(endpoint.method)) return null;
  if (endpointUsesMultipart(endpoint)) return null;
  if (endpoint.path.includes("{") && !endpoint.tryItPath) return null;
  if (endpoint.formatMatrix?.length) return null;
  if (endpoint.contentType && !endpoint.contentType.includes("json")) return null;

  const base = endpoint.tryItPath ?? endpoint.path;
  if (base.includes("{")) return null;

  const params = new URLSearchParams();
  for (const qp of endpoint.queryParams ?? []) {
    if (qp.default) params.set(qp.name, qp.default);
  }
  if (endpoint.tryItQuery) {
    for (const [name, value] of Object.entries(endpoint.tryItQuery)) {
      params.set(name, value);
    }
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function endpointSupportsTryIt(endpoint: DocsEndpoint): boolean {
  if (endpoint.tryIt === false) return false;
  if (!methodSupportsTryIt(endpoint.method)) return false;
  if (endpointUsesMultipart(endpoint)) return false;
  if (endpoint.formatMatrix?.length) return false;
  if (endpoint.contentType && !endpoint.contentType.includes("json")) return false;
  if (endpoint.path.includes("{") && !endpoint.tryItPath) return false;
  return true;
}

export function readStoredDocsApiKey(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(DOCS_API_KEY_STORAGE)?.trim() ?? "";
}

export function writeStoredDocsApiKey(value: string): void {
  if (typeof window === "undefined") return;
  const trimmed = value.trim();
  if (trimmed) {
    window.sessionStorage.setItem(DOCS_API_KEY_STORAGE, trimmed);
  } else {
    window.sessionStorage.removeItem(DOCS_API_KEY_STORAGE);
  }
}
