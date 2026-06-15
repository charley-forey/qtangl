"use client";

import { PRODUCTION_INDUSTRIES } from "@/lib/assess-config";

type AuthorizedDomainsPanelProps = {
  domains: string[];
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  industry: string;
  onIndustryChange: (industry: string) => void;
  showIndustry?: boolean;
};

export default function AuthorizedDomainsPanel({
  domains,
  selectedDomain,
  onSelectDomain,
  industry,
  onIndustryChange,
  showIndustry = true,
}: AuthorizedDomainsPanelProps) {
  return (
    <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      {showIndustry ? (
        <div>
          <label htmlFor="assess-industry" className="text-xs font-medium uppercase tracking-wide text-[var(--color-gray-400)]">
            Industry
          </label>
          <select
            id="assess-industry"
            value={industry}
            onChange={(event) => onIndustryChange(event.target.value)}
            className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-black px-3 py-2 text-sm text-white"
          >
            {PRODUCTION_INDUSTRIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-gray-400)]">
          Authorized domain
        </p>
        {domains.length === 0 ? (
          <p className="mt-2 text-sm text-amber-200">
            No domains authorized yet. Upload a certificate bundle below, or contact your Qtangl admin to
            add domains to your allowlist.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => onSelectDomain(domain)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedDomain === domain
                    ? "border-white bg-white text-black"
                    : "border-[var(--color-border)] text-[var(--color-gray-300)] hover:text-white"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
