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
    cause: "Missing or invalid API key in Authorization or x-api-key header.",
    fix: "Send Bearer <key> or x-api-key with a valid pilot token.",
  },
  {
    code: 422,
    meaning: "Unprocessable entity",
    cause: "Invalid payload shape, unsupported problem type, or infeasible constraints.",
    fix: "Fix field errors in the response detail; relax constraints and retry.",
  },
  {
    code: 429,
    meaning: "Too many requests",
    cause: "Per-key rate limit exceeded (default 120 requests per minute).",
    fix: "Backoff with jitter; cache results; request a higher limit for production.",
  },
  {
    code: 500,
    meaning: "Internal server error",
    cause: "Unexpected backend failure.",
    fix: "Retry with exponential backoff; contact support if persistent.",
  },
  {
    code: 501,
    meaning: "Not implemented",
    cause: "Problem type not yet supported on the live solver path (routing, allocation).",
    fix: "Use type schedule for live jobs, or follow the roadmap for routing/allocation.",
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
    meaning: "detail",
    cause: "Optional string or structured validation errors",
    fix: "Use for form-level fixes in integrations.",
  },
];
