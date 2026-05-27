"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  estimateHospitalRoi,
  formatCurrency,
  formatSavingsRange,
} from "@/lib/hospital-roi";
import { trackEvent } from "@/lib/analytics";

export default function RoiCalculator() {
  const [bedCount, setBedCount] = useState(420);
  const [quarterlyAgencySpend, setQuarterlyAgencySpend] = useState(1410000);
  const [monthlyCallouts, setMonthlyCallouts] = useState(44);
  const [averageSwapMinutes, setAverageSwapMinutes] = useState(22);

  const estimate = useMemo(
    () =>
      estimateHospitalRoi({
        bedCount,
        quarterlyAgencySpend,
        monthlyCallouts,
        averageSwapMinutes,
      }),
    [averageSwapMinutes, bedCount, monthlyCallouts, quarterlyAgencySpend]
  );

  function trackUsage() {
    trackEvent("roi_calculator_used", {
      bedCount,
      quarterlyAgencySpend,
      monthlyCallouts,
      averageSwapMinutes,
    });
  }

  return (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <p className="text-label">ROI calculator</p>
      <h3 className="mt-3 text-xl font-semibold text-white">Turn the demo into your own savings case</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
          Bed count
          <input
            type="number"
            className="rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-white"
            value={bedCount}
            onChange={(event) => {
              setBedCount(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
          Quarterly agency spend
          <span className="text-xs text-[var(--color-gray-500)]">
            Current: {formatCurrency(quarterlyAgencySpend, true)}
          </span>
          <input
            type="number"
            className="rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-white"
            value={quarterlyAgencySpend}
            onChange={(event) => {
              setQuarterlyAgencySpend(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
          Monthly call-outs
          <input
            type="number"
            className="rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-white"
            value={monthlyCallouts}
            onChange={(event) => {
              setMonthlyCallouts(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--color-gray-300)]">
          Average manual swap minutes
          <input
            type="number"
            className="rounded-xl border border-[var(--border)] bg-black px-4 py-3 text-white"
            value={averageSwapMinutes}
            onChange={(event) => {
              setAverageSwapMinutes(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Annual savings</p>
          <p
            className="mt-2 text-lg font-semibold leading-snug text-white tabular-nums sm:text-xl"
            title={formatSavingsRange(estimate.annualSavingsLow, estimate.annualSavingsHigh)}
          >
            {formatSavingsRange(estimate.annualSavingsLow, estimate.annualSavingsHigh, true)}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--color-gray-500)]">
            {formatSavingsRange(estimate.annualSavingsLow, estimate.annualSavingsHigh)}
          </p>
        </div>
        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/35 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Hours recovered / month</p>
          <p className="mt-2 text-lg font-semibold tabular-nums text-white sm:text-xl">
            {estimate.monthlyHoursRecovered.toLocaleString()}
          </p>
        </div>
        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/35 p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Estimated payback</p>
          <p className="mt-2 text-lg font-semibold text-white sm:text-xl">
            {estimate.estimatedPaybackWeeks} weeks
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-[var(--color-gray-300)]">{estimate.summary}</p>

      <div className="mt-5">
        <Button
          href={`/access?source=roi-calc&interest=${encodeURIComponent("Resource allocation")}`}
          onClick={() => trackEvent("roi_cta_clicked", estimate)}
        >
          Discuss this for my hospital
        </Button>
      </div>
    </Card>
  );
}
