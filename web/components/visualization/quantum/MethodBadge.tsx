import { methodBadgeCopy } from "@/lib/copy/visualization";

type MethodBadgeProps = {
  method?: string;
  className?: string;
};

export default function MethodBadge({
  method = "classical",
  className = "",
}: MethodBadgeProps) {
  const normalizedMethod = method === "hybrid" ? "hybrid" : "classical";
  const copy = methodBadgeCopy[normalizedMethod];

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border border-[var(--border)] bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-gray-200)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      title={copy.description}
      aria-label={copy.description}
    >
      {copy.label}
    </span>
  );
}
