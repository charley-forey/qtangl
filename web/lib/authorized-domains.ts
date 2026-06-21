import { fetchQtanglJson } from "@/lib/api";
import { patchDashboardJson } from "@/lib/dashboard-bff";

export async function addAuthorizedDomainsMany(
  domains: string[],
  attestation: string,
  options?: { useBff?: boolean; apiKey?: string }
): Promise<string[]> {
  const body = { action: "add_many" as const, domains, attestation };
  if (options?.useBff) {
    const payload = await patchDashboardJson<{ domains?: string[] }>("/tenant/authorized-domains", body);
    return payload.domains ?? domains;
  }
  const payload = await fetchQtanglJson<{ domains?: string[] }>("/tenant/authorized-domains", {
    method: "PATCH",
    body: JSON.stringify(body),
    apiKey: options?.apiKey,
  });
  return payload.domains ?? domains;
}
