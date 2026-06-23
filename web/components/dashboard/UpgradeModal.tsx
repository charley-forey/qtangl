"use client";

import { useCallback, useState } from "react";

import Button from "@/components/ui/Button";
import { postDashboardJson } from "@/lib/dashboard-bff";

export type UpgradeProduct = "assess" | "monitor" | "convert";

export type UpgradeContext = {
  source?: string;
  domain?: string;
  readinessScore?: number | null;
};

type Props = {
  open: boolean;
  product: UpgradeProduct;
  context?: UpgradeContext | null;
  onClose: () => void;
  onMessage?: (message: string) => void;
  salesLed?: boolean;
};

const COPY: Record<
  UpgradeProduct,
  { title: string; body: string; cta: string; preview?: string[] }
> = {
  assess: {
    title: "Unlock production baseline",
    body: "Your free trial scan is complete. Purchase a production baseline assessment for signed PDF, CBOM export, and executive report.",
    cta: "Continue to checkout",
  },
  monitor: {
    title: "Upgrade to Monitor",
    body: "Scheduled re-scans, drift alerts, and remediation tracking require a Monitor subscription.",
    cta: "Subscribe to Monitor",
    preview: [
      "Weekly or bi-weekly automated re-scans per domain",
      "Drift alerts when crypto posture changes",
      "Webhook and Jira ticketing integrations",
      "100 scans per month (vs 5 on Assess Free)",
    ],
  },
  convert: {
    title: "Upgrade to Convert",
    body: "Crypto-flip orchestration, program management, and verify-fix at scale require Convert.",
    cta: "Contact sales",
    preview: [
      "Verify-fix workflow on critical findings",
      "Remediation program board with owners and waves",
      "Crypto-flip orchestration (CLM integrations)",
      "Executive program velocity reporting",
    ],
  },
};

function personalizedMonitorLine(context?: UpgradeContext | null): string | null {
  if (!context?.domain || context.readinessScore == null) {
    return null;
  }
  return `Your baseline on ${context.domain} scored ${context.readinessScore} — Monitor catches drift before your next audit.`;
}

export default function UpgradeModal({ open, product, context, onClose, onMessage, salesLed }: Props) {
  const [loading, setLoading] = useState(false);
  const copy = COPY[product];
  const personalized = product === "monitor" ? personalizedMonitorLine(context) : null;

  const startCheckout = useCallback(async () => {
    if (product === "convert") {
      window.location.href = "/convert";
      return;
    }
    setLoading(true);
    try {
      const payload = await postDashboardJson<{ checkoutUrl?: string; code?: string; message?: string }>(
        "/tenant/billing/checkout",
        { product }
      );
      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return;
      }
      onMessage?.(payload.message ?? "Checkout is unavailable. Contact support@qtangl.com.");
    } catch (exc) {
      onMessage?.(exc instanceof Error ? exc.message : "Unable to start checkout.");
    } finally {
      setLoading(false);
    }
  }, [onMessage, product]);

  if (!open) return null;

  if (salesLed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
        <div className="max-w-md rounded-2xl border border-[var(--border-strong)] bg-black p-6">
          <h2 className="text-lg font-semibold text-white">Enterprise account</h2>
          <p className="mt-2 text-sm text-[var(--color-gray-300)]">
            Your organization is on a sales-led plan. Contact your Qtangl account manager or visit the procurement pack.
          </p>
          <div className="mt-4 flex gap-2">
            <Button href="/trust/procurement-pack" size="sm">
              Procurement pack
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        className="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-black p-6 shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-white">{copy.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{copy.body}</p>
        {personalized ? (
          <p className="mt-3 text-sm leading-7 text-amber-100">{personalized}</p>
        ) : null}
        {copy.preview && copy.preview.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[var(--color-gray-400)]">
            {copy.preview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">
          By continuing you agree to our{" "}
          <a href="/terms" className="underline hover:text-white">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </a>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" onClick={startCheckout} disabled={loading}>
            {loading ? "Redirecting…" : copy.cta}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
