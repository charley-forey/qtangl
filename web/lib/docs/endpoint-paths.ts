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
  if (endpointId.startsWith("airline-")) {
    return `/docs/reference/airline/${endpointId.replace("airline-", "")}`;
  }
  if (endpointId.startsWith("ev-fleet-")) {
    return `/docs/reference/ev-fleet/${endpointId.replace("ev-fleet-", "")}`;
  }
  return `/docs/reference/${endpointId}`;
}
