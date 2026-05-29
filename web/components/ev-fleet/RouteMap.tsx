import type { EvFleetSolveResponse, EvFleetStop } from "@/lib/ev-fleet";

import { EvFleetEmptyState, EvFleetSection, EvFleetSectionHeader } from "./ui";

export default function RouteMap({
  stops,
  solveResponse,
}: {
  stops: EvFleetStop[];
  solveResponse: EvFleetSolveResponse | null;
}) {
  const assignments = solveResponse?.routing.assignments ?? [];
  return (
    <EvFleetSection className="h-full">
      <EvFleetSectionHeader label="Routing" title="VRP assignments" description="Stops per van after stage-1 route repair." />
      {!solveResponse ? (
        <div className="mt-6">
          <EvFleetEmptyState title="No routes yet" description="Solve to see stop assignments per van." />
        </div>
      ) : (
        <ul className="mt-6 max-h-80 space-y-3 overflow-y-auto">
          {assignments.map((route) => (
            <li key={route.vehicle_id} className="rounded-lg border border-[var(--border)] p-4">
              <p className="font-medium text-white">{route.vehicle_id}</p>
              <p className="mt-1 text-xs text-[var(--color-gray-500)]">
                {route.stop_ids.length} stops · {route.total_km.toFixed(1)} km ·{" "}
                {route.energy_needed_kwh.toFixed(1)} kWh needed
              </p>
              <p className="mt-2 text-xs text-[var(--color-gray-400)]">
                Return {route.depot_return_time.slice(11, 16)} · SOC {route.return_soc_kwh.toFixed(1)} kWh
              </p>
            </li>
          ))}
          {solveResponse.routing.unserved_stop_ids.length > 0 ? (
            <li className="text-xs text-amber-200">
              Unserved: {solveResponse.routing.unserved_stop_ids.join(", ")}
            </li>
          ) : null}
        </ul>
      )}
      <p className="mt-4 text-xs text-[var(--color-gray-600)]">{stops.length} stops in fixture</p>
    </EvFleetSection>
  );
}
