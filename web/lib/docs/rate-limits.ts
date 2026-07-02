export type DocsRateLimitRow = {
  category: string;
  limit: string;
  scope: string;
  envVar?: string;
  httpStatus: "429" | "402" | "policy";
  notes?: string;
};

export type DocsEndpointLimitRow = {
  method: string;
  path: string;
  countsTowardLimit: boolean;
  notes?: string;
};

export type DocsTierQuotaRow = {
  tier: string;
  maxScansPerMonth: number | string;
  maxSchedules: number;
  maxApiKeys: number | string;
};

export type DocsEnvVarRow = {
  variable: string;
  defaultValue: string;
  scope: string;
};

/** Summary of all limit categories for the overview table. */
export const rateLimitCategories: DocsRateLimitRow[] = [
  {
    category: "Authenticated writes",
    limit: "300 / minute",
    scope: "Per API key or dashboard session",
    envVar: "QTANGL_RATE_LIMIT_PER_MINUTE",
    httpStatus: "429",
    notes: "Minimum floor 300; Redis when REDIS_URL is set",
  },
  {
    category: "Authenticated reads",
    limit: "No global counter",
    scope: "Per API key",
    httpStatus: "429",
    notes: "Polling GET /pqc/scan/{scanId} does not burn write budget",
  },
  {
    category: "Public verify & transparency",
    limit: "60 / minute",
    scope: "Per client IP",
    envVar: "QTANGL_VERIFY_RATE_LIMIT_PER_MINUTE",
    httpStatus: "429",
    notes: "Retry-After header on 429; in-memory per instance",
  },
  {
    category: "Assess signup",
    limit: "5 / hour",
    scope: "Per email domain",
    envVar: "QTANGL_ASSESS_SIGNUP_LIMIT_PER_HOUR",
    httpStatus: "429",
  },
  {
    category: "Lead capture",
    limit: "10 / hour",
    scope: "Per email domain",
    envVar: "QTANGL_LEAD_CAPTURE_LIMIT_PER_HOUR",
    httpStatus: "429",
  },
  {
    category: "Discovery scan enqueue",
    limit: "50 / hour",
    scope: "Per tenant",
    httpStatus: "429",
    notes: "Requires Redis",
  },
  {
    category: "Discovery findings ingest",
    limit: "10,000 / minute",
    scope: "Per tenant + agent",
    httpStatus: "429",
    notes: "Requires Redis",
  },
  {
    category: "Monthly scan quota",
    limit: "Tier-dependent",
    scope: "Per tenant",
    httpStatus: "402",
    notes: "Payment Required — not a rate limit",
  },
  {
    category: "Crypto flip budget",
    limit: "50 / day",
    scope: "Per tenant",
    httpStatus: "policy",
    notes: "Policy rejection; 24h KMS prod cooldown",
  },
];

export const authenticatedWriteExamples: DocsEndpointLimitRow[] = [
  { method: "POST", path: "/pqc/scan", countsTowardLimit: true, notes: "Supports Idempotency-Key" },
  { method: "POST", path: "/pqc/upload-bundle", countsTowardLimit: true },
  { method: "POST", path: "/optimize", countsTowardLimit: true },
  { method: "POST", path: "/tenant/discovery/host-scan", countsTowardLimit: true },
  { method: "POST", path: "/tenant/discovery/binary-scan", countsTowardLimit: true },
  { method: "POST", path: "/tenant/*", countsTowardLimit: true, notes: "Write mutations (require_auth_write)" },
];

export const authenticatedReadonlyExamples: DocsEndpointLimitRow[] = [
  { method: "GET", path: "/pqc/scan/{scanId}", countsTowardLimit: false, notes: "Safe for polling" },
  { method: "GET", path: "/pqc/report/{scanId}", countsTowardLimit: false },
  { method: "GET", path: "/pqc/inventory", countsTowardLimit: false },
  { method: "GET", path: "/pqc/scenarios", countsTowardLimit: false },
  { method: "GET", path: "/tenant/scans", countsTowardLimit: false },
  { method: "GET", path: "/tenant/me", countsTowardLimit: false },
];

export const publicRateLimitedEndpoints: DocsEndpointLimitRow[] = [
  { method: "GET", path: "/pqc/verify/{scanId}", countsTowardLimit: true },
  { method: "POST", path: "/pqc/verify", countsTowardLimit: true },
  { method: "GET", path: "/pqc/dogfood/latest", countsTowardLimit: true },
  { method: "GET", path: "/pqc/dogfood/summary", countsTowardLimit: true },
  { method: "GET", path: "/pqc/dogfood/history", countsTowardLimit: true },
  { method: "GET", path: "/pqc/dogfood/auditor-bundle", countsTowardLimit: true },
  { method: "GET", path: "/pqc/index", countsTowardLimit: true },
  { method: "GET", path: "/pqc/index/drift", countsTowardLimit: true },
  { method: "GET", path: "/pqc/transparency/consistency", countsTowardLimit: true },
  { method: "GET", path: "/pqc/transparency/witnesses", countsTowardLimit: true },
  { method: "POST", path: "/pqc/transparency/witness", countsTowardLimit: true },
  { method: "GET", path: "/pqc/transparency/root", countsTowardLimit: true },
  { method: "GET", path: "/pqc/transparency/keys", countsTowardLimit: true },
  { method: "GET", path: "/pqc/transparency/{contentHash}", countsTowardLimit: true },
];

export const signupLimits: DocsRateLimitRow[] = [
  {
    category: "POST /public/assess-signup",
    limit: "5 / hour",
    scope: "Per email domain",
    envVar: "QTANGL_ASSESS_SIGNUP_LIMIT_PER_HOUR",
    httpStatus: "429",
    notes: "Set <= 0 to disable",
  },
  {
    category: "POST /public/lead-capture",
    limit: "10 / hour",
    scope: "Per email domain",
    envVar: "QTANGL_LEAD_CAPTURE_LIMIT_PER_HOUR",
    httpStatus: "429",
    notes: "Set <= 0 to disable",
  },
];

export const discoveryLimits: DocsRateLimitRow[] = [
  {
    category: "Scan enqueue",
    limit: "50 / hour",
    scope: "Per tenant",
    httpStatus: "429",
    notes: "POST /tenant/discovery/host-scan, POST /tenant/discovery/binary-scan",
  },
  {
    category: "Findings ingest",
    limit: "10,000 / minute",
    scope: "Per tenant + agent",
    httpStatus: "429",
    notes: "POST /discovery/agent/findings",
  },
];

export const tierQuotas: DocsTierQuotaRow[] = [
  { tier: "free", maxScansPerMonth: 5, maxSchedules: 0, maxApiKeys: 1 },
  { tier: "monitor", maxScansPerMonth: 100, maxSchedules: 10, maxApiKeys: 5 },
  { tier: "convert", maxScansPerMonth: 500, maxSchedules: 25, maxApiKeys: 10 },
  { tier: "enterprise", maxScansPerMonth: 5000, maxSchedules: 100, maxApiKeys: "unlimited" },
];

export const rateLimitEnvVars: DocsEnvVarRow[] = [
  {
    variable: "QTANGL_RATE_LIMIT_PER_MINUTE",
    defaultValue: "300",
    scope: "Per API key / session token, 60s window",
  },
  {
    variable: "QTANGL_VERIFY_RATE_LIMIT_PER_MINUTE",
    defaultValue: "60",
    scope: "Per IP on public verify, transparency, and index routes",
  },
  {
    variable: "QTANGL_VERIFY_RATE_WINDOW_SEC",
    defaultValue: "60",
    scope: "Window length for public IP limit",
  },
  {
    variable: "QTANGL_ASSESS_SIGNUP_LIMIT_PER_HOUR",
    defaultValue: "5",
    scope: "Per email domain on assess signup",
  },
  {
    variable: "QTANGL_LEAD_CAPTURE_LIMIT_PER_HOUR",
    defaultValue: "10",
    scope: "Per email domain on lead capture",
  },
  {
    variable: "REDIS_URL",
    defaultValue: "unset",
    scope: "Enables distributed per-key and discovery limits",
  },
];

export const rateLimitErrorRows = [
  {
    code: 429,
    meaning: "Too many requests",
    cause: "Per-key rate limit exceeded (default 300/min) or public endpoint IP limit (60/min).",
    fix: "Backoff with jitter; poll read endpoints; cache results; contact support for production limits.",
  },
  {
    code: 402,
    meaning: "Payment required",
    cause: "Monthly scan quota or feature not included in current tier entitlements.",
    fix: "Upgrade via billing portal or contact sales for enterprise tier.",
  },
] as const;
