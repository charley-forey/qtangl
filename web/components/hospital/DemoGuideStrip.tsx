import Card from "@/components/ui/Card";

const STEPS = [
  {
    title: "Pick a scenario",
    detail: "Start with Sarah K.'s cath-lab call-out or try the ICU cascade and OR late add.",
  },
  {
    title: "Fire the call-out",
    detail: "Run the live CP-SAT pass plus the cached hybrid micro-solve replay.",
  },
  {
    title: "Compare three plans",
    detail: "Manual Excel, classical-only, and hybrid-diverse swaps sit side by side.",
  },
  {
    title: "Open the audit pack",
    detail: "QUBO snapshot, binding constraints, cost deltas, and QPU trace for compliance.",
  },
] as const;

export default function DemoGuideStrip() {
  return (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <p className="text-label">How to use this demo</p>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/30 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
              Step {index + 1}
            </p>
            <p className="mt-2 font-medium text-white">{step.title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-gray-400)]">{step.detail}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
