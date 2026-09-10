"use client";

import type { CompliancePack, ComplianceSummary } from "@/lib/pqc";

import { PqcChip } from "./ui";

type CompliancePanelProps = {
  pack?: CompliancePack;
  summary?: ComplianceSummary;
};

export default function CompliancePanel({ pack, summary }: CompliancePanelProps) {
  const resolvedSummary = summary ?? pack?.complianceSummary;
  const frameworks = pack?.primaryFrameworks ?? [];
  const controlThemes = pack?.controlThemes ?? [];
  const gapFindings = pack?.gapFindings ?? [];
  const atRisk = resolvedSummary?.atRiskCount ?? 0;
  const satisfied = resolvedSummary?.satisfiedCount ?? 0;

  if (!pack && !resolvedSummary) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        Run a scan to map findings to NIST, CNSA 2.0, PCI-DSS, HIPAA, and CMMC controls.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {(atRisk > 0 || satisfied > 0) && (
        <div className="flex flex-wrap gap-2">
          <PqcChip tone={atRisk > 0 ? "danger" : "ok"}>{atRisk} controls at risk</PqcChip>
          <PqcChip tone="ok">{satisfied} controls satisfied</PqcChip>
        </div>
      )}

      {frameworks.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
            Mapped frameworks
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {frameworks.map((framework) => (
              <li
                key={framework.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-black/30 px-4 py-3"
              >
                <p className="text-sm font-semibold text-white">{framework.name}</p>
                <p className="mt-1 text-xs leading-6 text-[var(--color-gray-400)]">
                  {framework.relevance}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {controlThemes.length > 0 && (
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Control mapping">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
            Control mapping
          </p>
          <table className="mt-3 min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              <tr>
                <th className="pb-2 pr-4">Framework</th>
                <th className="pb-2 pr-4">Control</th>
                <th className="pb-2">Theme</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-gray-300)]">
              {controlThemes.map((theme) => (
                <tr
                  key={`${theme.framework}-${theme.controlRef}`}
                  className="border-t border-[var(--border-subtle)]"
                >
                  <td className="py-2 pr-4 text-white">{theme.framework}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{theme.controlRef}</td>
                  <td className="py-2 text-xs leading-6">{theme.theme}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {gapFindings.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
            Gap findings
          </p>
          <ul className="mt-3 space-y-2">
            {gapFindings.slice(0, 6).map((finding, index) => (
              <li
                key={`${finding.framework}-${index}`}
                className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3"
              >
                <PqcChip tone={finding.status === "gap" ? "warn" : "neutral"}>
                  {finding.framework}
                </PqcChip>
                <div className="min-w-0">
                  <p className="text-xs leading-6 text-[var(--color-gray-300)]">{finding.finding}</p>
                  {finding.asset ? (
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">
                      {finding.asset}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] leading-5 text-[var(--color-gray-500)]">
        Control mappings are an inventory aid to accelerate audit preparation — not a formal attestation.
        Export the signed report and verify independently at /verify.
      </p>
    </div>
  );
}
