import type { CallOut, Scenario } from "@/lib/hospital";

import { HospitalChip, HospitalMetric, HospitalSection } from "./ui";

type CallOutEventProps = {
  scenario: Scenario;
  callout: CallOut;
};

export default function CallOutEvent({ scenario, callout }: CallOutEventProps) {
  return (
    <HospitalSection
      tone="feature"
      className="border-red-400/25 bg-[linear-gradient(165deg,rgba(220,38,38,0.14),rgba(255,255,255,0.02))]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <HospitalChip tone="alert">Active call-out</HospitalChip>
        <HospitalChip tone="neutral">{callout.urgency_minutes} min to cover</HospitalChip>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {scenario.title}
      </h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-gray-300)]">
        {scenario.summary}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HospitalMetric label="Nurse" value={callout.nurse_name} />
        <HospitalMetric label="Unit" value={callout.ward} />
        <HospitalMetric
          label="Credentials"
          value={callout.required_certifications.join(" · ")}
        />
        <HospitalMetric label="Shift window" value={`${callout.start.slice(11, 16)}–${callout.end.slice(11, 16)}`} />
      </div>
    </HospitalSection>
  );
}
