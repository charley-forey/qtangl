"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { estimateAirlineRoi, formatCurrency } from "@/lib/airline-roi";

import {
  AirlineInputLabel,
  AirlineMetric,
  AirlineSection,
  AirlineSectionHeader,
  airlineInputClass,
} from "./ui";

export default function RoiCalculator() {
  const [cancellationsPerMonth, setCancellationsPerMonth] = useState(8);
  const [passengersPerCancellation, setPassengersPerCancellation] = useState(140);
  const [costPerPassenger, setCostPerPassenger] = useState(850);
  const [recoveryRunsPerMonth, setRecoveryRunsPerMonth] = useState(45);

  const estimate = useMemo(
    () =>
      estimateAirlineRoi({
        cancellationsPerMonth,
        passengersPerCancellation,
        costPerPassenger,
        recoveryRunsPerMonth,
      }),
    [cancellationsPerMonth, costPerPassenger, passengersPerCancellation, recoveryRunsPerMonth]
  );

  function trackUsage() {
    trackEvent("roi_calculator_used", {
      cancellationsPerMonth,
      passengersPerCancellation,
      costPerPassenger,
    });
  }

  return (
    <AirlineSection>
      <AirlineSectionHeader
        label="Business case"
        title="Controllable cancellation impact"
        description="Model DOT-tracked disruption cost for your network. Figures are directional for OCC discussion."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AirlineInputLabel label="Cancellations / month">
          <input
            type="number"
            className={airlineInputClass}
            value={cancellationsPerMonth}
            onChange={(event) => {
              setCancellationsPerMonth(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </AirlineInputLabel>
        <AirlineInputLabel label="Passengers per cancellation">
          <input
            type="number"
            className={airlineInputClass}
            value={passengersPerCancellation}
            onChange={(event) => {
              setPassengersPerCancellation(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </AirlineInputLabel>
        <AirlineInputLabel label="Cost per passenger">
          <input
            type="number"
            className={airlineInputClass}
            value={costPerPassenger}
            onChange={(event) => {
              setCostPerPassenger(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </AirlineInputLabel>
        <AirlineInputLabel label="Recovery runs / month">
          <input
            type="number"
            className={airlineInputClass}
            value={recoveryRunsPerMonth}
            onChange={(event) => {
              setRecoveryRunsPerMonth(Number(event.target.value) || 0);
              trackUsage();
            }}
          />
        </AirlineInputLabel>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <AirlineMetric label="Monthly savings" value={formatCurrency(estimate.monthlySavings)} />
        <AirlineMetric label="Annual savings" value={formatCurrency(estimate.annualSavings)} />
      </div>
      <p className="mt-4 text-sm text-[var(--color-gray-400)]">{estimate.summary}</p>
      <div className="mt-6">
        <Button
          href="/access?source=demo-airline-roi"
          onClick={() => trackEvent("roi_cta_clicked", estimate)}
        >
          Request OCC briefing
        </Button>
      </div>
    </AirlineSection>
  );
}
