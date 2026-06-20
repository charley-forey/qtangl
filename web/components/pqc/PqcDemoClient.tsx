"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { ASSESS_PRODUCTION_MODE_ENABLED } from "@/lib/assess-config";
import type { CryptoAsset, Scenario } from "@/lib/pqc";
import { peekOnboardingToken } from "@/lib/pqc";
import { setStoredTenantApiKey } from "@/lib/tenant-api";
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
  const [onboardingLoginUrl, setOnboardingLoginUrl] = useState<string | null>(null);
  const [onboardingReady, setOnboardingReady] = useState(!onboardingToken);

  useEffect(() => {
    if (!onboardingToken || !ASSESS_PRODUCTION_MODE_ENABLED) {
      setOnboardingReady(true);
      return;
    }
    let cancelled = false;
    async function loadOnboarding() {
      try {
        const payload = await peekOnboardingToken(onboardingToken);
        if (cancelled) return;
        if (payload.loginUrl) {
          setOnboardingLoginUrl(payload.loginUrl);
        }
        if (payload.apiKey) {
          setStoredTenantApiKey(payload.apiKey);
          setInitialTenantKey(payload.apiKey);
          setInitialMode("production");
          window.dispatchEvent(new Event("qtangl-api-key-updated"));
          const url = new URL(window.location.href);
          url.searchParams.delete("onboarding");
          url.searchParams.set("mode", "production");
          window.history.replaceState({}, "", `${url.pathname}${url.search}`);
        } else if (payload.loginUrl) {
          setOnboardingError(null);
          setInitialMode("demo");
        } else {
          setOnboardingError("Onboarding link did not return credentials. Use dashboard sign-in.");
        }
      } catch (err) {
        if (!cancelled) {
          setOnboardingError(err instanceof Error ? err.message : "Onboarding failed.");
        }
      } finally {
        if (!cancelled) setOnboardingReady(true);
      }
    }
    void loadOnboarding();
    return () => {
      cancelled = true;
    };
  }, [onboardingToken]);

  if (!onboardingReady) {
    return <p className="text-sm text-[var(--color-gray-400)]">Retrieving your tenant key…</p>;
  }

  if (onboardingLoginUrl && !initialTenantKey && modeParam === "production") {
    return (
      <div className="rounded-lg border border-sky-500/30 bg-sky-950/40 p-4 text-sm text-sky-100">
        <p className="font-medium text-white">Sign in to run your production baseline</p>
        <p className="mt-2 text-[var(--color-gray-300)]">
          Your workspace is ready. Sign in with your work email to load authorized domains and scan history.
        </p>
        <Link
          href={onboardingLoginUrl}
          className="mt-4 inline-block rounded-full border border-white bg-white px-5 py-2 text-sm font-medium text-black"
        >
          Sign in to dashboard
        </Link>
      </div>
    );
  }

  return (
    <QtanglApiProvider initialMode={initialMode} initialTenantKey={initialTenantKey}>
      {onboardingError ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {onboardingError}
          {onboardingLoginUrl ? (
            <p className="mt-2">
              <Link href={onboardingLoginUrl} className="underline text-white">
                Sign in to dashboard
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
      <QDayCommandCenter {...props} />
    </QtanglApiProvider>
  );
}
