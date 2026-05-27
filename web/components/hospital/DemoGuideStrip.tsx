import {
  HospitalSection,
  HospitalSectionHeader,
} from "./ui";

const STEPS = [
  {
    title: "Select event",
    detail: "Cath lab, ICU cascade, or OR add-on.",
  },
  {
    title: "Run solve",
    detail: "Live CP-SAT plus hybrid micro-solve.",
  },
  {
    title: "Compare plans",
    detail: "Manual, classical, and three hybrid alternates.",
  },
  {
    title: "Export audit",
    detail: "QUBO, constraints, and QPU trace per plan.",
  },
] as const;

export default function DemoGuideStrip() {
  return (
    <HospitalSection>
      <HospitalSectionHeader
        label="Workflow"
        title="Four steps for your leadership review"
        description="Designed for CNO, COO, and workforce leaders—under two minutes to a defensible swap decision."
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
              <p className="mt-1 text-sm leading-5 text-[var(--color-gray-400)]">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </HospitalSection>
  );
}
