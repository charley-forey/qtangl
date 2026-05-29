import type { ChargePlan } from "@/lib/ev-fleet";

import { EvFleetSection, EvFleetSectionHeader } from "./ui";

const periodColor: Record<string, string> = {
  peak: "bg-amber-500/80",
  shoulder: "bg-sky-500/60",
  offpeak: "bg-emerald-500/60",
};

export default function ChargerGantt({ plan }: { plan: ChargePlan | null }) {
  if (!plan || plan.slots.length === 0) {
    return null;
  }

  const byCharger = new Map<string, typeof plan.slots>();
  for (const slot of plan.slots) {
    const list = byCharger.get(slot.charger_id) ?? [];
    list.push(slot);
    byCharger.set(slot.charger_id, list);
  }

  return (
    <EvFleetSection>
      <EvFleetSectionHeader label="Depot" title="Charger timeline" description="Active plan by bay and TOU period." />
      <div className="mt-6 space-y-2">
        {[...byCharger.entries()].slice(0, 8).map(([chargerId, slots]) => (
          <div key={chargerId} className="flex items-center gap-3">
            <span className="w-20 shrink-0 font-mono text-xs text-[var(--color-gray-500)]">{chargerId}</span>
            <div className="flex flex-1 flex-wrap gap-1">
              {slots.map((slot) => (
                <span
                  key={`${slot.vehicle_id}-${slot.start}`}
                  className={`rounded px-2 py-1 text-xs text-black ${periodColor[slot.period] ?? "bg-gray-500"}`}
                  title={`${slot.vehicle_id} ${slot.start.slice(11, 16)}`}
                >
                  {slot.vehicle_id.replace("veh-", "")}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </EvFleetSection>
  );
}
