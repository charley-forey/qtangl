"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ASSESS_PRODUCTION_MODE_ENABLED } from "@/lib/assess-config";
import type { CryptoAsset, Scenario } from "@/lib/pqc";
import { redeemOnboardingToken } from "@/lib/pqc";
import { QtanglApiProvider } from "@/lib/qtangl-api-context";

import QDayCommandCenter from "./QDayCommandCenter";

export default function PqcDemoClient(props: {
  initialInventory: CryptoAsset[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
}) {
  const searchParams = useSearchParams();
  const onboardingToken = searchParams.get("onboarding") ?? "";
  const modeParam = searchParams.get("mode");
  const [initialMode, setInitialMode] = useState<"demo" | "production">(
    modeParam === "production" && ASSESS_PRODUCTION_MODE_ENABLED ? "production" : "demo"
  );
  const [initialTenantKey, setInitialTenantKey] = useState<string | null>(null);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingReady, setOnboardingReady] = useState(!onboardingToken);

  useEffect(() => {
    if (!onboardingToken || !ASSESS_PRODUCTION_MODE_ENABLED) {
      setOnboardingReady(true);
      return;
    }
    let cancelled = false;
    async function redeem() {
      try {
        const payload = await redeemOnboardingToken(onboardingToken);
        if (cancelled) return;
        setInitialTenantKey(payload.apiKey);
        setInitialMode("production");
        const url = new URL(window.location.href);
        url.searchParams.delete("onboarding");
        url.searchParams.set("mode", "production");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      } catch (err) {
        if (!cancelled) {
          setOnboardingError(err instanceof Error ? err.message : "Onboarding failed.");
        }
      } finally {
        if (!cancelled) setOnboardingReady(true);
      }
    }
    void redeem();
    return () => {
      cancelled = true;
    };
  }, [onboardingToken]);

  if (!onboardingReady) {
    return <p className="text-sm text-[var(--color-gray-400)]">Retrieving your tenant key…</p>;
  }

  return (
    <QtanglApiProvider initialMode={initialMode} initialTenantKey={initialTenantKey}>
      {onboardingError ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {onboardingError}
        </div>
      ) : null}
      <QDayCommandCenter {...props} />
    </QtanglApiProvider>
  );
}
