"use client";

import { useEffect } from "react";

import Link from "next/link";

import { ASSESS_EVENTS } from "@/lib/analytics/assess-events";
import { trackEvent } from "@/lib/analytics";

type AssessScanErrorProps = {
  message: string;
  kind?: "domain_not_allowed" | "legal_required" | "payment_required" | "generic";
  blockedDomain?: string;
  onDismiss: () => void;
};

export type AssessScanErrorKind =
  | "domain_not_allowed"
  | "legal_required"
  | "payment_required"
  | "generic";

export default function AssessScanError({
  message,
  kind = "generic",
  blockedDomain,
  onDismiss,
}: AssessScanErrorProps) {
  const isLegalRequired = kind === "legal_required" || message.includes("legal_acceptance");
  const isDomainBlocked =
    kind === "domain_not_allowed" ||
    message.includes("not permitted") ||
    message.includes("limited to approved");
  const isPaymentRequired =
    kind === "payment_required" ||
    message.includes("Assess") ||
    message.includes("quota reached") ||
    message.includes("trial");

  useEffect(() => {
    if (isDomainBlocked && blockedDomain) {
      trackEvent(ASSESS_EVENTS.blockedDomain, { domain: blockedDomain, kind });
    } else if (isPaymentRequired) {
      trackEvent(ASSESS_EVENTS.scanFailed, { message, kind: "payment_required" });
    } else {
      trackEvent(ASSESS_EVENTS.scanFailed, { message, kind });
    }
  }, [isDomainBlocked, blockedDomain, isPaymentRequired, kind, message]);

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
      <p>{message}</p>
      {isLegalRequired ? (
        <p className="mt-3 text-xs leading-6 text-red-100/90">
          Accept the current Terms of Service on the Scans tab before running production baselines.{" "}
          <Link href="/dashboard?tab=scans" className="underline text-white">
            Go to legal acceptance
          </Link>
        </p>
      ) : null}
      {isPaymentRequired ? (
        <div className="mt-3 space-y-2 text-xs leading-6 text-red-100/90">
          <p>Your options:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              <button type="button" className="underline text-white" onClick={onDismiss}>
                Run a free sample scenario
              </button>{" "}
              — offline fixture, no payment required
            </li>
            <li>
              <Link href="/assess/start" className="underline text-white">
                Start an authorized workspace
              </Link>{" "}
              — one free live scan on your work domain
            </li>
            <li>
              <Link href="/pricing" className="underline text-white">
                View Assess pricing
              </Link>{" "}
              — production baselines and signed exports
            </li>
          </ol>
        </div>
      ) : null}
      {isDomainBlocked ? (
        <div className="mt-3 space-y-2 text-xs leading-6 text-red-100/90">
          <p>
            Scanning{" "}
            {blockedDomain ? (
              <code className="rounded bg-black/30 px-1.5 py-0.5 text-red-50">{blockedDomain}</code>
            ) : (
              "your domain"
            )}{" "}
            requires an authorized workspace:
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              <Link href="/assess/start" className="underline text-white">
                Self-serve signup
              </Link>{" "}
              — free workspace, 5 scans/month, domain matched to work email
            </li>
            <li>
              <Link href="/access" className="underline text-white">
                Request a pilot
              </Link>{" "}
              — multi-domain estates and Monitor onboarding
            </li>
            <li>Or switch to a sample scenario or the OQS live demo above</li>
          </ol>
        </div>
      ) : null}
      <button type="button" className="mt-3 text-xs underline" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
