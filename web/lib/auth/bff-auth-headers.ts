export type BffAuthForwardMode = "assertion" | "sessionKey" | "both";

/** Build upstream Railway auth headers from dashboard session cookies. */
export function buildBffUpstreamAuthHeaders(options: {
  assertion?: string | null;
  sessionKey?: string | null;
}): Record<string, string> {
  const headers: Record<string, string> = {};
  if (options.assertion) {
    headers["X-Qtangl-Session"] = options.assertion;
  }
  if (options.sessionKey) {
    headers.Authorization = `Bearer ${options.sessionKey}`;
  }
  return headers;
}

export function bffAuthForwardMode(
  assertion?: string | null,
  sessionKey?: string | null
): BffAuthForwardMode | null {
  const hasAssertion = Boolean(assertion);
  const hasSessionKey = Boolean(sessionKey);
  if (hasAssertion && hasSessionKey) return "both";
  if (hasAssertion) return "assertion";
  if (hasSessionKey) return "sessionKey";
  return null;
}
