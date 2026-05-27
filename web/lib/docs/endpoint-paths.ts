export function endpointDocsHref(endpointId: string): string {
  if (endpointId === "optimize") {
    return "/docs/reference/optimize";
  }
  if (endpointId === "health") {
    return "/docs/reference/health";
  }
  if (endpointId.startsWith("hospital-")) {
    return `/docs/reference/hospital/${endpointId.replace("hospital-", "")}`;
  }
  return `/docs/reference/${endpointId}`;
}
