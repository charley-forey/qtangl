import type { ReactNode } from "react";

type DocsCalloutVariant = "info" | "warning" | "tip" | "honesty";

const variantStyles: Record<DocsCalloutVariant, string> = {
  info: "border-[var(--border-strong)] bg-white/[0.04]",
  warning: "border-amber-500/30 bg-amber-500/8",
  tip: "border-emerald-500/25 bg-emerald-500/6",
  honesty: "border-white/20 bg-white/[0.06]",
};

const variantLabels: Record<DocsCalloutVariant, string> = {
  info: "Note",
  warning: "Warning",
  tip: "Tip",
  honesty: "Method honesty",
};

type DocsCalloutProps = {
  variant?: DocsCalloutVariant;
  title?: string;
  children: ReactNode;
};

export default function DocsCallout({
  variant = "info",
  title,
  children,
}: DocsCalloutProps) {
  return (
    <aside
      className={[
        "rounded-2xl border px-5 py-4 text-sm leading-7 text-[var(--color-gray-300)]",
        variantStyles[variant],
      ].join(" ")}
      role="note"
    >
      <p className="text-label text-white">{title ?? variantLabels[variant]}</p>
      <div className="mt-3 [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </aside>
  );
}
