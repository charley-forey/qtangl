"use client";

import { useMemo } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import LegalAcceptancePanel, { type LegalAcceptBilling } from "@/components/dashboard/LegalAcceptancePanel";
import { isLegalAcceptanceCurrent, type TenantBillingFlags } from "@/lib/dashboard-legal";
import { formatUtcDateTime } from "@/lib/format";

type Props = {
  tenantSettings?: Record<string, unknown> | null;
  onAccepted?: (billing: LegalAcceptBilling) => void;
};

export default function LegalCompliancePanel({ tenantSettings, onAccepted }: Props) {
  const billing = (tenantSettings?.billing as TenantBillingFlags | undefined) ?? {};
  const termsRequired = String(tenantSettings?.termsVersionRequired ?? "2026-06-08");
  const current = isLegalAcceptanceCurrent(tenantSettings);
  const scanAllowlist = (tenantSettings?.scanAllowlist as string[] | undefined) ?? [];

  const summary = useMemo(
    () => [
      {
        label: "Terms accepted",
        value: billing.termsAcceptedAt ? formatUtcDateTime(billing.termsAcceptedAt) : "Not accepted",
      },
      {
        label: "Terms version",
        value: billing.termsVersion ? `${billing.termsVersion}${current ? "" : " (stale)"}` : "—",
      },
      {
        label: "Required version",
        value: termsRequired,
      },
      {
        label: "Scan authorization",
        value: billing.scanAuthorizationAt
          ? `${formatUtcDateTime(billing.scanAuthorizationAt)} · ${billing.scanAuthorizedBy ?? "—"}`
          : "Not recorded",
      },
      {
        label: "Authorized domain",
        value: billing.scanAuthorizedDomain ?? scanAllowlist[0] ?? "—",
      },
    ],
    [billing, current, scanAllowlist, termsRequired]
  );

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Legal compliance</Eyebrow>
      <dl className="mt-4 space-y-2 text-sm">
        {summary.map((row) => (
          <div key={row.label} className="flex flex-wrap justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
            <dt className="text-[var(--color-gray-500)]">{row.label}</dt>
            <dd className="text-right text-white">{row.value}</dd>
          </div>
        ))}
      </dl>
      {!current ? (
        <div className="mt-4">
          <LegalAcceptancePanel
            policyUpdated={Boolean(billing.termsAcceptedAt)}
            requireScanAuthorization={scanAllowlist.length > 0}
            domain={scanAllowlist[0] ?? ""}
            onAccepted={onAccepted}
          />
        </div>
      ) : null}
    </Card>
  );
}
