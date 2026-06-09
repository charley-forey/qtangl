/** Map endpoint id to public docs URL. Keep in sync with dynamic reference routes. */
export function endpointDocsHref(endpointId: string): string {
  if (endpointId === "optimize") {
    return "/docs/reference/optimize";
  }
  if (endpointId === "health") {
    return "/docs/reference/health";
  }
  if (endpointId === "health-ready") {
    return "/docs/reference/health/ready";
  }
  if (endpointId === "metrics") {
    return "/docs/reference/health/metrics";
  }
  if (endpointId.startsWith("sharing-")) {
    return `/docs/reference/sharing/${endpointId.replace("sharing-", "")}`;
  }
  if (endpointId.startsWith("hospital-")) {
    return `/docs/reference/hospital/${endpointId.replace("hospital-", "")}`;
  }
  if (endpointId.startsWith("airline-")) {
    return `/docs/reference/airline/${endpointId.replace("airline-", "")}`;
  }
  if (endpointId.startsWith("ev-fleet-")) {
    return `/docs/reference/ev-fleet/${endpointId.replace("ev-fleet-", "")}`;
  }
  if (endpointId === "tenant-passport" || endpointId === "pqc-passport") {
    return "/docs/reference/pqc/passport";
  }
  if (endpointId === "pqc-cbom-ingest") {
    return "/docs/reference/pqc/cbom-import";
  }
  if (endpointId.startsWith("pqc-")) {
    return `/docs/reference/pqc/${endpointId.replace("pqc-", "")}`;
  }
  if (endpointId.startsWith("tenant-")) {
    return `/docs/reference/tenant/${endpointId.replace("tenant-", "")}`;
  }
  if (endpointId.startsWith("admin-")) {
    return `/docs/reference/admin/${endpointId.replace("admin-", "")}`;
  }
  if (endpointId.startsWith("public-")) {
    return `/docs/reference/public/${endpointId.replace("public-", "")}`;
  }
  return `/docs/reference/${endpointId}`;
}

export function endpointIdFromTenantSlug(slug: string): string {
  return `tenant-${slug}`;
}

export function endpointIdFromAdminSlug(slug: string): string {
  return `admin-${slug}`;
}

export function endpointIdFromPublicSlug(slug: string): string {
  return `public-${slug}`;
}

export function endpointIdFromHealthSlug(slug: string): string {
  if (slug === "ready") return "health-ready";
  if (slug === "metrics") return "metrics";
  return `health-${slug}`;
}

export function endpointIdFromSharingSlug(slug: string): string {
  return `sharing-${slug}`;
}

export function endpointIdFromPqcSlug(slug: string): string {
  const slugToId: Record<string, string> = {
    passport: "tenant-passport",
    "cbom-import": "pqc-cbom-ingest",
  };
  return slugToId[slug] ?? `pqc-${slug}`;
}
