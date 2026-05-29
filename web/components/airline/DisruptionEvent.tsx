import type { Disruption, Scenario } from "@/lib/airline";

import { AirlineChip, AirlineMetric, AirlineSection } from "./ui";

export default function DisruptionEvent({
  scenario,
  disruption,
}: {
  scenario: Scenario;
  disruption: Disruption;
}) {
  return (
    <AirlineSection
      tone="feature"
      className="border-amber-400/25 bg-[linear-gradient(165deg,rgba(245,158,11,0.12),rgba(255,255,255,0.02))]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <AirlineChip tone="alert">Active disruption</AirlineChip>
        <AirlineChip tone="neutral">{disruption.urgency_minutes} min to recover</AirlineChip>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{scenario.title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-gray-300)]">
        {scenario.summary}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AirlineMetric label="Tail" value={disruption.aircraft_id} />
        <AirlineMetric label="Station" value={disruption.station} />
        <AirlineMetric label="Quals" value={disruption.required_quals.join(" · ")} />
        <AirlineMetric label="Crew affected" value={String(disruption.crew_affected)} />
      </div>
    </AirlineSection>
  );
}
