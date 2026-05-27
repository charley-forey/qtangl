import { amplitudeBarsCopy } from "@/lib/copy/visualization";

type AmplitudeBar = {
  label: string;
  value: number;
  caption?: string;
};

type AmplitudeBarsProps = {
  items: AmplitudeBar[];
  className?: string;
  variant?: "panel" | "embedded";
};

export function AmplitudeBarsContent({
  items,
  className = "",
}: {
  items: AmplitudeBar[];
  className?: string;
}) {
  return (
    <div className={["space-y-4", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-[var(--color-gray-200)]">{item.label}</span>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gray-500)]">
              {item.value}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(0, Math.min(item.value, 100))}%` }}
            />
          </div>
          {item.caption ? (
            <p className="text-xs leading-6 text-[var(--color-gray-500)]">{item.caption}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function AmplitudeBars({
  items,
  className = "",
  variant = "panel",
}: AmplitudeBarsProps) {
  if (variant === "embedded") {
    return (
      <div className={className}>
        <p className="text-label">{amplitudeBarsCopy.eyebrow}</p>
        <h3 className="mt-3 text-base font-semibold text-white">{amplitudeBarsCopy.title}</h3>
        <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
          {amplitudeBarsCopy.description}
        </p>
        <AmplitudeBarsContent items={items} className="mt-5" />
      </div>
    );
  }

  return (
    <section
      aria-label={amplitudeBarsCopy.title}
      className={[
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{amplitudeBarsCopy.eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{amplitudeBarsCopy.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        {amplitudeBarsCopy.description}
      </p>
      <AmplitudeBarsContent items={items} className="mt-6" />
    </section>
  );
}
