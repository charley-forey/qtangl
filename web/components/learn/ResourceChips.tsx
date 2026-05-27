type Chip = {
  label: string;
  tone?: "default" | "strong" | "muted";
  title?: string;
};

type ResourceChipsProps = {
  chips: Chip[];
};

export default function ResourceChips({ chips }: ResourceChipsProps) {
  const visible = chips.filter((chip) => chip.label && chip.label !== "Unknown" && chip.label !== "Mixed");
  if (!visible.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Resource attributes">
      {visible.map((chip) => (
        <span
          key={chip.label}
          role="listitem"
          title={chip.title}
          className={[
            "rounded-full border px-3 py-1 text-xs",
            chip.tone === "strong"
              ? "border-[var(--border-strong)] bg-white/[0.06] text-white"
              : chip.tone === "muted"
                ? "border-[var(--border)] text-[var(--color-gray-400)]"
                : "border-[var(--border)] text-[var(--color-gray-300)]",
          ].join(" ")}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}
