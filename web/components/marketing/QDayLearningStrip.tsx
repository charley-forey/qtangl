"use client";

import MoscaCalculator from "@/components/marketing/MoscaCalculator";
import MoscaTimeline from "@/components/pqc/MoscaTimeline";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import type { MoscaAssessment } from "@/lib/pqc";

const sampleMosca: MoscaAssessment = {
  data_shelf_life_years: 10,
  migration_time_years: 5,
  years_to_q_day: 8,
  inequality_holds: true,
  summary:
    "10-year data retention plus a 5-year migration runway exceeds an 8-year quantum timeline — act now on HNDL exposure.",
};

export default function QDayLearningStrip() {
  return (
    <div className="space-y-8">
      <div className="content-reading">
        <Eyebrow>Learn before you scan</Eyebrow>
        <h2 className="heading-section mt-4">Understand Q-Day risk in minutes</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
          Harvest-now-decrypt-later exposure is a planning problem, not a broken-crypto alarm. Use Mosca&apos;s
          inequality to see if your data outlives your migration runway — then run a live assessment.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MoscaCalculator />
        <Card tone="panel" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Example Mosca timeline</Eyebrow>
          <p className="mt-3 text-sm text-[var(--color-gray-400)]">
            Illustrative 10-year retention · 5-year migration · 8-year quantum horizon (regional bank scenario).
          </p>
          <div className="mt-6">
            <MoscaTimeline mosca={sampleMosca} />
          </div>
        </Card>
      </div>

      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Eyebrow>ROI & evidence</Eyebrow>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-gray-300)]">
              Compare spreadsheet programs and consulting baselines to continuous Monitor — or preview the
              signed report pack your GRC team receives after every assessment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Button href="/resources/roi" variant="secondary">
              ROI calculator
            </Button>
            <Button href="/verify?token=sample-token" variant="secondary">
              See a signed report
            </Button>
            <Button href="/assess">Run assessment</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
