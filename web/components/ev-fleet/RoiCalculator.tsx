"use client";

import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { estimateAnnualSavings, formatCurrency } from "@/lib/ev-fleet-roi";

import {
  EvFleetInputLabel,
  EvFleetMetric,
  EvFleetSection,
  EvFleetSectionHeader,
  evFleetInputClass,
} from "./ui";

export default function RoiCalculator() {
  const [fleetSize, setFleetSize] = useState(50);
  const [dailySavings, setDailySavings] = useState(420);

  const annual = useMemo(
    () => estimateAnnualSavings(dailySavings, fleetSize),
    [dailySavings, fleetSize]
  );

  return (
    <EvFleetSection>
      <EvFleetSectionHeader
        label="Business case"
        title="Depot savings estimator"
        description="Rank 3 use case: $400–900/day per 50-EV depot from peak avoidance."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <EvFleetInputLabel label="Fleet size (vans)">
          <input
            type="number"
            className={evFleetInputClass}
            value={fleetSize}
            onChange={(e) => {
              setFleetSize(Number(e.target.value));
              trackEvent("ev_fleet_roi_adjusted", { fleetSize: Number(e.target.value) });
            }}
          />
        </EvFleetInputLabel>
        <EvFleetInputLabel label="$/day saved vs naive">
          <input
            type="number"
            className={evFleetInputClass}
            value={dailySavings}
            onChange={(e) => setDailySavings(Number(e.target.value))}
          />
        </EvFleetInputLabel>
      </div>
      <div className="mt-6">
        <EvFleetMetric label="Estimated annual savings" value={formatCurrency(annual)} />
      </div>
    </EvFleetSection>
  );
}
