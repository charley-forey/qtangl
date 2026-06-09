import { docsEndpoints } from "@/lib/docs/endpoints";
import {
  endpointIdFromAdminSlug,
  endpointIdFromHealthSlug,
  endpointIdFromPqcSlug,
  endpointIdFromPublicSlug,
  endpointIdFromSharingSlug,
  endpointIdFromTenantSlug,
} from "@/lib/docs/endpoint-paths";
import type { DocsEndpoint } from "@/lib/docs/types";

export function listEndpointSlugs(prefix: string): string[] {
  return Object.keys(docsEndpoints)
    .filter((id) => id.startsWith(`${prefix}-`))
    .map((id) => id.slice(prefix.length + 1));
}

export function getTenantEndpoint(slug: string): DocsEndpoint | undefined {
  return docsEndpoints[endpointIdFromTenantSlug(slug)];
}

export function getAdminEndpoint(slug: string): DocsEndpoint | undefined {
  return docsEndpoints[endpointIdFromAdminSlug(slug)];
}

export function getPublicEndpoint(slug: string): DocsEndpoint | undefined {
  return docsEndpoints[endpointIdFromPublicSlug(slug)];
}

export function getHealthEndpoint(slug: string): DocsEndpoint | undefined {
  return docsEndpoints[endpointIdFromHealthSlug(slug)];
}

export function getSharingEndpoint(slug: string): DocsEndpoint | undefined {
  return docsEndpoints[endpointIdFromSharingSlug(slug)];
}

/** PQC slugs served by dynamic route (static pages take precedence). */
const PQC_STATIC_SLUGS = new Set([
  "inventory",
  "scenarios",
  "target",
  "handshake-trace",
  "standards",
  "upload-bundle",
  "scan",
  "scan-status",
  "handshake-prove",
  "report",
  "passport",
  "transparency",
  "cbom-import",
]);

export function listDynamicPqcSlugs(): string[] {
  return Object.keys(docsEndpoints)
    .filter((id) => id.startsWith("pqc-"))
    .map((id) => id.replace("pqc-", ""))
    .filter((slug) => !PQC_STATIC_SLUGS.has(slug));
}

export function getPqcEndpoint(slug: string): DocsEndpoint | undefined {
  return docsEndpoints[endpointIdFromPqcSlug(slug)];
}
