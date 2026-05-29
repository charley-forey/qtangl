import type { AirlineFlight, AirlineSolveResponse } from "@/lib/airline";

import { AirlineSection, AirlineSectionHeader } from "./ui";

export default function CascadeMap({
  flights,
  solveResponse,
  affectedLegIds,
}: {
  flights: AirlineFlight[];
  solveResponse: AirlineSolveResponse | null;
  affectedLegIds: string[];
}) {
  const affected = new Set(affectedLegIds);
  const tailByLeg = new Map(
    (solveResponse?.routing.tail_assignments ?? []).map((item) => [item.leg_id, item.tail_id])
  );

  const rows = flights.filter((flight) => affected.has(flight.id) || !affected.size);

  return (
    <AirlineSection className="min-h-0">
      <AirlineSectionHeader
        label="Network"
        title="Cascade & tail assignment"
        description={
          flights.length > 0
            ? `${rows.length} legs in view · amber rows are in the disruption cascade`
            : "Flight network loads when the API connects."
        }
      />
      <div className="mt-4 max-h-[min(26rem,52vh)] overflow-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/30">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="sticky top-0 bg-[#0a0b0d] text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
            <tr>
              <th className="px-4 py-3">Flight</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Dep</th>
              <th className="px-4 py-3">Tail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((flight) => {
              const inCascade = affected.has(flight.id);
              const tail = tailByLeg.get(flight.id) ?? flight.tail_id;
              return (
                <tr
                  key={flight.id}
                  className={inCascade ? "bg-amber-500/10" : "border-t border-[var(--border)]"}
                >
                  <td className="px-4 py-3 font-medium text-white">{flight.flight_no}</td>
                  <td className="px-4 py-3 text-[var(--color-gray-300)]">
                    {flight.origin} → {flight.dest}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[var(--color-gray-400)]">
                    {flight.sched_dep.slice(11, 16)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-gray-300)]">
                    {tail}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AirlineSection>
  );
}
