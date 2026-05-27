"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import {
  estimateHospitalRoi,
  formatCurrency,
  formatSavingsRange,
} from "@/lib/hospital-roi";
import { trackEvent } from "@/lib/analytics";

import {
  HospitalInputLabel,
  HospitalMetric,
  HospitalSection,
  HospitalSectionHeader,
  hospitalInputClass,
} from "./ui";

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
    <HospitalSection>
      <HospitalSectionHeader
        label="Business case"
        title="Annual impact estimator"
        description="Model agency spend and call-out volume for your facility. Figures are directional for executive discussion."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <HospitalInputLabel label="Licensed beds">
          <input
            type="number"
            className={hospitalInputClass}
            value={bedCount}
            onChange={(event) => {
              setBedCount(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </HospitalInputLabel>
        <HospitalInputLabel
          label="Quarterly agency spend"
          hint={formatCurrency(quarterlyAgencySpend, true)}
        >
          <input
            type="number"
            className={hospitalInputClass}
            value={quarterlyAgencySpend}
            onChange={(event) => {
              setQuarterlyAgencySpend(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </HospitalInputLabel>
        <HospitalInputLabel label="Call-outs per month">
          <input
            type="number"
            className={hospitalInputClass}
            value={monthlyCallouts}
            onChange={(event) => {
              setMonthlyCallouts(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </HospitalInputLabel>
        <HospitalInputLabel label="Avg. manual swap time (min)">
          <input
            type="number"
            className={hospitalInputClass}
            value={averageSwapMinutes}
            onChange={(event) => {
              setAverageSwapMinutes(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </HospitalInputLabel>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <HospitalMetric
          label="Annual savings"
          value={formatSavingsRange(estimate.annualSavingsLow, estimate.annualSavingsHigh, true)}
          hint={formatSavingsRange(estimate.annualSavingsLow, estimate.annualSavingsHigh)}
        />
        <HospitalMetric
          label="Hours recovered / mo."
          value={estimate.monthlyHoursRecovered.toLocaleString()}
        />
        <HospitalMetric label="Payback" value={`${estimate.estimatedPaybackWeeks} wks`} />
      </div>

      <p className="mt-5 text-sm leading-6 text-[var(--color-gray-400)]">{estimate.summary}</p>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <Button
          href={`/access?source=roi-calc&interest=${encodeURIComponent("Resource allocation")}`}
          onClick={() => trackEvent("roi_cta_clicked", estimate)}
        >
          Discuss for my health system
        </Button>
      </div>
    </HospitalSection>
  );
}
