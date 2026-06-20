"use client";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { assessIntentCopy } from "@/lib/copy/readiness-assess-intent";

export default function AssessMyDomainPanel() {
  const { myDomainChecklist } = assessIntentCopy;

  return (
    <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-sm text-[var(--color-gray-300)]">
        Production scans require an authorized workspace. Qtangl only scans domains on your tenant
        allowlist — this protects you and third parties.
      </p>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-gray-400)]">
          What you need
        </p>
        <ul className="mt-3 space-y-2">
          {myDomainChecklist.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-[var(--color-gray-300)]">
              <span className="text-emerald-400" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          href="/assess/start"
          onClick={() => trackEvent("assess_my_domain_cta", { destination: "assess_start" })}
        >
          Create free Assess workspace
        </Button>
        <Button
          href="/access"
          variant="secondary"
          onClick={() => trackEvent("assess_my_domain_cta", { destination: "access" })}
        >
          Request sales-led pilot
        </Button>
      </div>
      <p className="text-xs text-[var(--color-gray-500)]">
        Already have a welcome email? Paste your tenant API key in the scanner above to load authorized
        domains.
      </p>
    </div>
  );
}
