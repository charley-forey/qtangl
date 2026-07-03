"use client";

import Link from "next/link";

const MONITOR_ACCESS_HREF = "/access?interest=Q-Day%20Monitor%20(annual)";

const OPTIONS = [
  {
    key: "external",
    label: "External scan",
    detail: "TLS, JWKS, SSH, email — agentless baseline",
    locked: false,
    href: null,
  },
  {
    key: "hostFleet",
    label: "Host fleet",
    detail: "Qtangl Unified Sensor on enrolled endpoints",
    locked: true,
    href: "/command-center",
  },
  {
    key: "codeRepos",
    label: "Source code",
    detail: "CryptoScan + dependency reachability on repos",
    locked: true,
    href: "/command-center",
  },
  {
    key: "containerImages",
    label: "Container images",
    detail: "Binary CBOM via CBOMkit-theia",
    locked: true,
    href: MONITOR_ACCESS_HREF,
  },
] as const;

export default function AssessDiscoveryScope() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-gray-400)]">
        External discovery runs on every assessment. Connect fleet, CI, or image integrations on the
        dashboard — or request Monitor for continuous coverage.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const cardClass =
            "relative flex gap-3 rounded-lg border p-3 transition " +
            (opt.locked
              ? "border-[var(--color-border)] bg-black/20 hover:border-[var(--border-strong)]"
              : "border-emerald-500/30 bg-emerald-500/5");

          const body = (
            <>
              <span className="mt-0.5 shrink-0 text-xs" aria-hidden>
                {opt.locked ? "🔒" : "✓"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-white">{opt.label}</span>
                  {opt.key === "external" ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200">
                      Always on
                    </span>
                  ) : opt.locked ? (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-gray-400)]">
                      Locked
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs text-[var(--color-gray-500)]">{opt.detail}</span>
                {opt.locked && opt.href ? (
                  <span className="mt-2 inline-block text-xs font-medium text-white underline underline-offset-4">
                    {opt.href.startsWith("/access") ? "Request Monitor →" : "Open dashboard →"}
                  </span>
                ) : null}
              </span>
            </>
          );

          if (opt.locked && opt.href) {
            return (
              <Link key={opt.key} href={opt.href} className={cardClass}>
                {body}
              </Link>
            );
          }

          return (
            <div key={opt.key} className={cardClass} aria-disabled={opt.key === "external"}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
