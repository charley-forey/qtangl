"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const WIDGETS = [
  { id: "kpi", label: "KPI strip" },
  { id: "trend", label: "Readiness trend" },
  { id: "digest", label: "Executive digest" },
  { id: "insights", label: "Insights grid" },
  { id: "heatmap", label: "Business unit heatmap" },
] as const;

export default function DashboardWidgetPreferences({
  layout,
  onSave,
}: {
  layout?: { pinned?: string[]; hidden?: string[] };
  onSave: (pinned: string[], hidden: string[]) => Promise<void>;
}) {
  const hidden = new Set(layout?.hidden ?? []);
  const pinned = new Set(layout?.pinned ?? ["kpi", "trend", "digest"]);

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Customize dashboard</Eyebrow>
      <ul className="mt-4 space-y-2 text-sm">
        {WIDGETS.map((widget) => (
          <li key={widget.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!hidden.has(widget.id)}
              onChange={async (e) => {
                const nextHidden = new Set(hidden);
                if (e.target.checked) {
                  nextHidden.delete(widget.id);
                } else {
                  nextHidden.add(widget.id);
                }
                await onSave([...pinned], [...nextHidden]);
              }}
            />
            <span className="text-white">{widget.label}</span>
            <button
              type="button"
              className="text-xs text-[var(--color-gray-500)] underline"
              onClick={async () => {
                const nextPinned = new Set(pinned);
                nextPinned.add(widget.id);
                await onSave([...nextPinned], [...hidden]);
              }}
            >
              Pin
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
