type ProbabilityGridProps = {
  className?: string;
};

export default function ProbabilityGrid({
  className = "",
}: ProbabilityGridProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-0 opacity-45 sm:opacity-70",
        "[background-image:radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1px)]",
        "[background-size:24px_24px]",
        "[mask-image:radial-gradient(circle_at_center,black_20%,transparent_78%)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
