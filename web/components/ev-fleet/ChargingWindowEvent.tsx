import type { Scenario } from "@/lib/ev-fleet";

import { EvFleetChip, EvFleetSection } from "./ui";

export default function ChargingWindowEvent({ scenario }: { scenario: Scenario }) {
  const { window } = scenario;
  return (
    <EvFleetSection tone="feature" className="border-emerald-500/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <EvFleetChip tone="alert">Charge window</EvFleetChip>
          <h3 className="mt-3 text-lg font-semibold text-white">{scenario.title}</h3>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">{window.reason}</p>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-gray-500)]">Peak window</dt>
            <dd className="font-mono text-white">
              {window.peak_window_start.slice(11, 16)}–{window.peak_window_end.slice(11, 16)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-gray-500)]">Fleet / chargers</dt>
            <dd className="text-white">
              {window.fleet_size} vans · {window.charger_count} L2
            </dd>
          </div>
        </dl>
      </div>
    </EvFleetSection>
  );
}
