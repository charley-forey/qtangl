"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "qtangl-assess-first-scan-guide-dismissed";

const TOUR_STEPS = [
  {
    tab: "executive" as const,
    title: "Executive summary",
    detail: "Readiness score, Mosca timeline, and top findings — start here for board context.",
  },
  {
    tab: "evidence" as const,
    title: "Evidence exports",
    detail: "Download PDF, CBOM, or copy a verify link auditors can check independently.",
  },
  {
    tab: "remediation" as const,
    title: "Remediation backlog",
    detail: "Prioritized migration items with what-if score projections.",
  },
];

type AssessFirstScanGuideProps = {
  onGoToTab: (tab: "executive" | "evidence" | "remediation") => void;
};

export default function AssessFirstScanGuide({ onGoToTab }: AssessFirstScanGuideProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
        trackEvent("assess_results_tour_shown");
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const current = TOUR_STEPS[step];

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    trackEvent("assess_results_tour_dismissed", { step });
    setVisible(false);
  }

  function goToStep(index: number) {
    setStep(index);
    onGoToTab(TOUR_STEPS[index].tab);
    trackEvent("assess_results_tour_step", { step: index + 1, tab: TOUR_STEPS[index].tab });
  }

  function next() {
    if (step < TOUR_STEPS.length - 1) {
      goToStep(step + 1);
      return;
    }
    dismiss();
  }

  return (
    <Card tone="feature" className="rounded-[var(--radius-xl)]" data-tour="results-guide">
      <Eyebrow>Results tour — step {step + 1} of {TOUR_STEPS.length}</Eyebrow>
      <p className="mt-3 text-sm font-semibold text-white">{current.title}</p>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">{current.detail}</p>
      <ol className="mt-4 flex flex-wrap gap-2">
        {TOUR_STEPS.map((item, index) => (
          <li key={item.tab}>
            <button
              type="button"
              onClick={() => goToStep(index)}
              className={[
                "rounded-full border px-3 py-1 text-xs",
                index === step
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-[var(--border)] text-[var(--color-gray-400)]",
              ].join(" ")}
              aria-current={index === step ? "step" : undefined}
            >
              {index + 1}. {item.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button size="sm" onClick={next}>
          {step < TOUR_STEPS.length - 1 ? "Next" : "Finish tour"}
        </Button>
        <Button variant="secondary" size="sm" onClick={dismiss}>
          Skip
        </Button>
      </div>
    </Card>
  );
}
