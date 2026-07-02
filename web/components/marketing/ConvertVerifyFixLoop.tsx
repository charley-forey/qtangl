"use client";

import { useConvertDemo, type ConvertEvidenceTab } from "@/components/marketing/convert-demo-context";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const STEPS: Array<{ id: string; label: string; tab: ConvertEvidenceTab }> = [
  { id: "finding", label: "Finding", tab: "diff" },
  { id: "assign", label: "Assign owner", tab: "jira" },
  { id: "remediate", label: "Remediate", tab: "pdf" },
  { id: "rescan", label: "Re-scan", tab: "diff" },
  { id: "proof", label: "Signed proof", tab: "verify" },
];

export default function ConvertVerifyFixLoop() {
  const { evidenceTab, setEvidenceTab } = useConvertDemo();
  const activeStep = STEPS.find((s) => s.tab === evidenceTab)?.id ?? "finding";

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Verify-fix loop</Eyebrow>
      <p className="mt-3 text-sm text-[var(--color-gray-400)]">
        Click a step to preview the corresponding evidence artifact.
      </p>
      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        role="list"
        aria-label="Verify-fix workflow steps"
      >
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              role="listitem"
              onClick={() => setEvidenceTab(step.tab)}
              className={[
                "rounded-full border px-4 py-2 text-xs font-medium transition",
                activeStep === step.id
                  ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-200"
                  : "border-[var(--border)] text-[var(--color-gray-400)] hover:border-[var(--border-strong)] hover:text-white",
              ].join(" ")}
            >
              {step.label}
            </button>
            {index < STEPS.length - 1 ? (
              <span className="hidden text-[var(--color-gray-600)] sm:inline" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-[var(--color-gray-500)]">
        Loop back to Monitor for continuous drift detection after proof is attached.
      </p>
    </Card>
  );
}
