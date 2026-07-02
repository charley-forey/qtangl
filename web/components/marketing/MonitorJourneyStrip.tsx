import Link from "next/link";

const STEPS = [
  { label: "Assess", href: "/assess", status: "done" as const },
  { label: "Monitor", href: "/monitor", status: "current" as const },
  { label: "Convert", href: "/convert", status: "next" as const },
];

export default function MonitorJourneyStrip() {
  return (
    <nav
      aria-label="Qtangl journey"
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
    >
      {STEPS.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2 sm:gap-4">
          <Link
            href={step.href}
            className={[
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              step.status === "current"
                ? "border-white bg-white text-black"
                : step.status === "done"
                  ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                  : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
            ].join(" ")}
            aria-current={step.status === "current" ? "page" : undefined}
          >
            {step.status === "done" ? "✓ " : ""}
            {step.label}
          </Link>
          {index < STEPS.length - 1 ? (
            <span className="text-[var(--color-gray-600)]" aria-hidden>
              →
            </span>
          ) : null}
        </div>
      ))}
      <Link
        href="/journey"
        className="text-xs text-[var(--color-gray-500)] underline underline-offset-4 hover:text-white"
      >
        Full journey map
      </Link>
    </nav>
  );
}
