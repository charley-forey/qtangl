import { AirlineSection, AirlineSectionHeader } from "./ui";

const STEPS = [
  { title: "Load disruption", detail: "MX hold, FDP bust, or weather cascade." },
  { title: "Recover", detail: "Tail routing + CP-SAT crew assignment." },
  { title: "Compare plans", detail: "Manual, classical, and hybrid alternates." },
  { title: "Export audit", detail: "FAR 117 proof, QUBO, and QPU trace." },
] as const;

export default function DemoGuideStrip() {
  return (
    <AirlineSection>
      <AirlineSectionHeader
        label="Workflow"
        title="Four steps for OCC leadership review"
        description="Designed for operations controllers—under two minutes to a defensible recovery plan."
      />
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/25 p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/[0.06] text-sm font-semibold text-white">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-white">{step.title}</p>
              <p className="mt-1 text-sm leading-5 text-[var(--color-gray-400)]">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </AirlineSection>
  );
}
