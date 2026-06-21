/** Shared legal acceptance helpers for dashboard tabs. */

export type TenantBillingFlags = {
  termsAcceptedAt?: string | null;
  termsVersion?: string | null;
  scanAuthorizationAt?: string | null;
  scanAuthorizedBy?: string | null;
  scanAuthorizedDomain?: string | null;
};

export function isLegalAcceptanceCurrent(
  tenantSettings: Record<string, unknown> | null | undefined
): boolean {
  const billing = (tenantSettings?.billing as TenantBillingFlags | undefined) ?? {};
  const termsRequired = String(tenantSettings?.termsVersionRequired ?? "2026-06-08");
  return Boolean(billing.termsAcceptedAt && billing.termsVersion === termsRequired);
}

/** Prior acceptance exists but terms version is stale (policy bump). */
export function isTermsBumpRequired(
  tenantSettings: Record<string, unknown> | null | undefined
): boolean {
  const billing = (tenantSettings?.billing as TenantBillingFlags | undefined) ?? {};
  const termsRequired = String(tenantSettings?.termsVersionRequired ?? "2026-06-08");
  return Boolean(billing.termsAcceptedAt && billing.termsVersion !== termsRequired);
}
