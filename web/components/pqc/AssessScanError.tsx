"use client";

import { useEffect } from "react";

import Link from "next/link";

import { ASSESS_EVENTS } from "@/lib/analytics/assess-events";
import { trackEvent } from "@/lib/analytics";

type AssessScanErrorProps = {
  message: string;
  kind?: "domain_not_allowed" | "legal_required" | "generic";
  blockedDomain?: string;
  onDismiss: () => void;
};

export type AssessScanErrorKind = "domain_not_allowed" | "legal_required" | "generic";

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

  useEffect(() => {
    if (isDomainBlocked && blockedDomain) {
      trackEvent(ASSESS_EVENTS.blockedDomain, { domain: blockedDomain, kind });
    } else {
      trackEvent(ASSESS_EVENTS.scanFailed, { message, kind });
    }
  }, [isDomainBlocked, blockedDomain, kind, message]);

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
