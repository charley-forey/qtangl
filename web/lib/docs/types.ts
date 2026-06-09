export type DocsFeatureStatus =
  | "ga"
  | "pilot"
  | "coming-soon"
  | "research"
  | "deprecated";

export type DocsNavItem = {
  name: string;
  href: string;
  status?: DocsFeatureStatus;
  description?: string;
};

export type DocsNavSection = {
  id: string;
  title: string;
  items: DocsNavItem[];
};

export type DocsFieldRow = {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
  example?: string;
};

export type DocsErrorRow = {
  code: number;
  meaning: string;
  cause: string;
  fix: string;
};

export type DocsCodeLanguage = "curl" | "javascript" | "python" | "typescript" | "response";

export type DocsEndpointExample = {
  label: string;
  request?: object | string;
  response?: object | string;
};

export type DocsEndpoint = {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  status: DocsFeatureStatus;
  title: string;
  summary: string;
  auth: boolean;
  /** Required RBAC role(s) when auth is true. */
  role?: string;
  rateLimit?: string;
  requestFields?: DocsFieldRow[];
  responseFields?: DocsFieldRow[];
  queryParams?: DocsFieldRow[];
  errors?: number[];
  examples: DocsEndpointExample[];
  notes?: string[];
  /** Primary response content type when not application/json. */
  contentType?: string;
  /** Whether Idempotency-Key header is supported. */
  idempotency?: boolean;
  /** Pagination model description. */
  pagination?: string;
  /** Per-format response notes (e.g. report format matrix). */
  formatMatrix?: DocsFieldRow[];
};

export type DocsSearchEntry = {
  href: string;
  title: string;
  section?: string;
  description?: string;
  headings?: string[];
};

export type DocsTocItem = {
  id: string;
  title: string;
  level: 2 | 3;
  /** Document order for stable TOC sorting. */
  order?: number;
};
