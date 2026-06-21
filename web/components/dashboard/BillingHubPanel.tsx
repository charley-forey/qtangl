"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";

type Entitlements = {
  tier?: string;
  maxScansPerMonth?: number;
  maxSchedules?: number;
  maxApiKeys?: number | null;
  features?: string[];
};

type Props = {
  tier?: string;
  scansThisMonth?: number;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
  onMessage?: (message: string) => void;
};

export default function BillingHubPanel({
  tier: tierProp = "free",
  scansThisMonth = 0,
  onOpenUpgrade,
  onMessage,
}: Props) {
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBilling = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchDashboardJson<{
        portalUrl?: string | null;
        entitlements?: Entitlements;
        message?: string;
      }>("/tenant/billing/portal");
      setPortalUrl(typeof payload.portalUrl === "string" ? payload.portalUrl : null);
      setEntitlements(payload.entitlements ?? null);
      if (payload.message) {
        onMessage?.(payload.message);
      }
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Unable to load billing details.");
    } finally {
      setLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  const tier = entitlements?.tier ?? tierProp;
  const quotaLimit = entitlements?.maxScansPerMonth ?? null;
  const quotaPct =
    quotaLimit && quotaLimit > 0 ? Math.min(100, Math.round((scansThisMonth / quotaLimit) * 100)) : null;

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Billing &amp; plan</Eyebrow>
      {loading ? (
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">Loading billing…</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusPill label={`Tier: ${tier}`} tone="info" />
            {quotaPct != null ? (
              <StatusPill
                label={`Scans ${scansThisMonth}/${quotaLimit} (${quotaPct}%)`}
                tone={quotaPct >= 90 ? "warning" : "neutral"}
              />
            ) : (
              <span className="text-xs text-[var(--color-gray-400)]">{scansThisMonth} scans this month</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tier === "free" ? (
              <>
                <Button type="button" size="sm" onClick={() => onOpenUpgrade?.("assess")}>
                  Upgrade Assess
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => onOpenUpgrade?.("monitor")}>
                  Upgrade Monitor
                </Button>
              </>
            ) : tier === "monitor" ? (
              <Button type="button" size="sm" variant="secondary" onClick={() => onOpenUpgrade?.("convert")}>
                Upgrade Convert
              </Button>
            ) : null}
            {portalUrl ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => window.open(portalUrl, "_blank", "noopener,noreferrer")}
              >
                Manage billing
              </Button>
            ) : null}
          </div>
        </>
      )}
    </Card>
  );
}
