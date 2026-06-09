import type { DocsErrorRow } from "@/lib/docs/types";

export const httpErrors: DocsErrorRow[] = [
  {
    code: 400,
    meaning: "Bad request",
    cause: "Malformed JSON or missing required headers.",
    fix: "Validate Content-Type and JSON syntax before retrying.",
  },
  {
    code: 401,
    meaning: "Unauthorized",
    cause: "Missing or invalid API key in Authorization, x-api-key, or query param.",
    fix: "Send Bearer <key> or x-api-key with a valid tenant token.",
  },
  {
    code: 402,
    meaning: "Payment required",
    cause: "Feature not included in current entitlements (e.g. Monitor schedules, remediation automate).",
    fix: "Upgrade via billing portal or contact sales for enterprise tier.",
  },
  {
    code: 403,
    meaning: "Forbidden",
    cause: "Valid key but insufficient role (viewer attempting write) or wrong admin key.",
    fix: "Use operator or admin role key; check RBAC matrix.",
  },
  {
    code: 404,
    meaning: "Not found",
    cause: "Scan, schedule, share link, or resource id does not exist or expired.",
    fix: "Verify id and tenant scope; share links expire per expiresHours.",
  },
  {
    code: 413,
    meaning: "Payload too large",
    cause: "CBOM ingest or upload exceeds size limit.",
    fix: "Split large CBOM documents or use cloud pull integration.",
  },
  {
    code: 422,
    meaning: "Unprocessable entity",
    cause: "Invalid payload shape, unsupported scenario, or infeasible constraints.",
    fix: "Fix field errors in response detail; relax constraints and retry.",
  },
  {
    code: 429,
    meaning: "Too many requests",
    cause: "Per-key rate limit exceeded (default 300 requests per minute) or public endpoint limit.",
    fix: "Backoff with jitter; cache results; request higher limit for production.",
  },
  {
    code: 500,
    meaning: "Internal server error",
    cause: "Unexpected backend failure; includes requestId in response.",
    fix: "Retry with exponential backoff; contact support with requestId if persistent.",
  },
  {
    code: 503,
    meaning: "Service unavailable",
    cause: "Persistence disabled, auth DB unreachable, or admin API not configured.",
    fix: "Retry shortly; schedules require Postgres persistence enabled.",
  },
  {
    code: 501,
    meaning: "Not implemented",
    cause: "Problem type not yet supported on live solver path (routing, allocation).",
    fix: "Use type schedule for live jobs, or follow Labs roadmap.",
  },
];

export const errorEnvelopeFields: DocsErrorRow[] = [
  {
    code: 0,
    meaning: "status",
    cause: '"error" on failure paths',
    fix: "Branch client logic on HTTP status first, then parse message.",
  },
  {
    code: 0,
    meaning: "message",
    cause: "Human-readable explanation",
    fix: "Surface to operators; log for engineering.",
  },
  {
    code: 0,
    meaning: "requestId",
    cause: "Correlation id from X-Request-Id middleware",
    fix: "Include in support tickets for 500 errors.",
  },
  {
    code: 0,
    meaning: "detail",
    cause: "Optional string or structured validation errors",
    fix: "Use for form-level fixes in integrations.",
  },
];
