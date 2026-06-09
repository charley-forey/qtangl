import type { DocsEndpoint, DocsFeatureStatus } from "@/lib/docs/types";

type EndpointInput = Omit<DocsEndpoint, "id" | "status" | "title" | "auth"> & {
  status?: DocsFeatureStatus;
  title?: string;
  auth?: boolean;
};

/** Build a DocsEndpoint with sensible defaults for API reference pages. */
export function defineEndpoint(
  id: string,
  input: EndpointInput,
): DocsEndpoint {
  const method = input.method;
  const path = input.path;
  return {
    id,
    method,
    path,
    status: input.status ?? "pilot",
    title: input.title ?? `${method} ${path}`,
    summary: input.summary,
    auth: input.auth ?? true,
    role: input.role,
    rateLimit: input.rateLimit,
    requestFields: input.requestFields,
    responseFields: input.responseFields,
    queryParams: input.queryParams,
    errors: input.errors ?? (input.auth ? [401, 403, 404, 422, 429, 500, 503] : [404, 422, 429, 500]),
    examples: input.examples ?? [{ label: "Success", response: { status: "success" } }],
    notes: input.notes,
    contentType: input.contentType,
    idempotency: input.idempotency,
    pagination: input.pagination,
  };
}

export const ROLE_ANY = "viewer | operator | admin";
export const ROLE_WRITE = "operator | admin";
export const ROLE_ADMIN = "admin";
export const ROLE_PUBLIC = "none";

export function statusForTier(tier: "ga" | "pilot" = "pilot"): DocsFeatureStatus {
  return tier;
}
