export default function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "critical" | "info";
}) {
  const classes =
    tone === "success"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : tone === "warning"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
        : tone === "critical"
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : tone === "info"
            ? "border-sky-500/40 bg-sky-500/10 text-sky-200"
            : "border-[var(--border-subtle)] bg-white/5 text-[var(--color-gray-300)]";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium ${classes}`}>
      {label}
    </span>
  );
}
