import Card from "@/components/ui/Card";
import type { CallOut, Scenario } from "@/lib/hospital";

type CallOutEventProps = {
  scenario: Scenario;
  callout: CallOut;
};

export default function CallOutEvent({ scenario, callout }: CallOutEventProps) {
  return (
    <Card
      tone="feature"
      className="rounded-[var(--radius-feature)] border-red-300/30 bg-[linear-gradient(180deg,rgba(255,82,82,0.18),rgba(255,255,255,0.03))]"
    >
      <p className="text-label text-red-100">04:11 alert</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{scenario.title}</h3>
      <p className="mt-4 text-base leading-8 text-[var(--color-gray-200)]">{scenario.summary}</p>
      <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-[var(--color-gray-400)]">Nurse</dt>
          <dd className="mt-1 text-white">{callout.nurse_name}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-400)]">Ward</dt>
          <dd className="mt-1 text-white">{callout.ward}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-400)]">Required certifications</dt>
          <dd className="mt-1 text-white">{callout.required_certifications.join(", ")}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-400)]">Decision window</dt>
          <dd className="mt-1 text-white">{callout.urgency_minutes} minutes</dd>
        </div>
      </dl>
    </Card>
  );
}
