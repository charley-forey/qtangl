"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  getHndlVerticalPreset,
  hndlQuantumTimelineDefault,
  moscaHolds,
  type HndlVerticalId,
} from "@/lib/copy/hndl-data";
import { trackEvent } from "@/lib/analytics";
import { buildAssessMiniHref } from "@/lib/hndl-funnel";

const verticalOptions: { id: HndlVerticalId; label: string }[] = [
  { id: "healthcare", label: "Healthcare / payers" },
  { id: "banking", label: "Banking / finance" },
  { id: "government", label: "Government / defense" },
  { id: "saas", label: "SaaS / tech" },
];

type HndlExposureEstimatorProps = {
  defaultVertical?: HndlVerticalId;
  source?: string;
};

export default function HndlExposureEstimator({
  defaultVertical = "healthcare",
  source = "q-day-hndl",
}: HndlExposureEstimatorProps) {
  const [vertical, setVertical] = useState<HndlVerticalId>(defaultVertical);
  const [migrationYears, setMigrationYears] = useState(7);
  const [quantumYears, setQuantumYears] = useState(hndlQuantumTimelineDefault.defaultYears);

  const preset = getHndlVerticalPreset(vertical);
  const dataYears = preset.shelfLifeYears;
  const exposed = moscaHolds(dataYears, migrationYears, quantumYears);
  const assessHref = buildAssessMiniHref({ source, content: "estimator" });

  useEffect(() => {
    setMigrationYears(preset.migrationYearsDefault);
  }, [preset.migrationYearsDefault, vertical]);

  useEffect(() => {
    trackEvent("hndl_estimator_complete", { vertical, exposed });
  }, [vertical, exposed]);

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Are you exposed?</Eyebrow>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        Select your industry and migration runway. We pre-fill typical data shelf-life from sector norms.
      </p>
      <fieldset className="mt-8 space-y-6">
        <legend className="sr-only">HNDL exposure estimator inputs</legend>
        <label className="block text-sm">
          <span className="text-label text-[var(--color-gray-500)]">Industry / data type</span>
          <select
            value={vertical}
            onChange={(event) => setVertical(event.target.value as HndlVerticalId)}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
            aria-label="Industry or data type"
          >
            {verticalOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-6 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="text-label text-[var(--color-gray-500)]">
              X — Data shelf-life ({preset.shelfLifeRange})
            </span>
            <input
              type="number"
              readOnly
              value={dataYears}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2 text-[var(--color-gray-400)]"
              aria-label={`Data shelf-life ${dataYears} years`}
            />
          </label>
          <label className="block text-sm">
            <span className="text-label text-[var(--color-gray-500)]">Y — Migration runway (years)</span>
            <input
              type="number"
              min={1}
              max={20}
              value={migrationYears}
              onChange={(event) => setMigrationYears(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
              aria-label="Migration runway in years"
            />
          </label>
          <label className="block text-sm">
            <span className="text-label text-[var(--color-gray-500)]">Z — Quantum timeline (years)</span>
            <input
              type="number"
              min={1}
              max={30}
              value={quantumYears}
              onChange={(event) => setQuantumYears(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-white"
              aria-label="Years until cryptographically relevant quantum computer"
            />
          </label>
        </div>
      </fieldset>
      <div
        className="mt-8 rounded-xl border border-[var(--border)] bg-black/55 px-5 py-4"
        aria-live="polite"
        role="status"
      >
        <p className="text-sm text-[var(--color-gray-400)]">
          {dataYears} + {migrationYears} = {dataYears + migrationYears} vs Z = {quantumYears}
        </p>
        <p className="mt-2 text-lg font-semibold text-white">
          {exposed
            ? "Inequality holds — HNDL exposure today for your data profile."
            : "Inequality does not hold — lower immediate HNDL pressure for this profile."}
        </p>
        {exposed ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--color-gray-300)]">
            {preset.highestRiskData.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={assessHref}
          className="touch-target relative inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black"
          onClick={() =>
            trackEvent("hndl_cta_click", {
              audience: vertical,
              destination: assessHref,
              placement: "estimator",
            })
          }
        >
          Run free mini-assessment
        </Link>
        <Link
          href="/q-day/mosca-inequality"
          className="inline-flex items-center text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
          onClick={() =>
            trackEvent("hndl_cta_click", {
              audience: vertical,
              destination: "/q-day/mosca-inequality",
              placement: "estimator",
            })
          }
        >
          Mosca deep dive →
        </Link>
      </div>
    </Card>
  );
}
