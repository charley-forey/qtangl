import ParticleField from "@/components/quantum/ParticleField";

const readinessVisualLabels = ["Assess", "Monitor", "Convert"] as const;

type EntanglementFieldProps = {
  className?: string;
  labels?: readonly string[];
};

export default function EntanglementField({
  className = "",
  labels = readinessVisualLabels,
}: EntanglementFieldProps) {
  return (
    <div
      className={[
        "surface-panel-feature rounded-[var(--radius-feature)] card-size-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-xl)+0.125rem)] border border-white/10 bg-black/45">
        <ParticleField />
      </div>
      <div className="relative z-10 mt-6 flex flex-col items-start gap-2 text-xs uppercase tracking-[0.28em] text-[var(--color-gray-400)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
