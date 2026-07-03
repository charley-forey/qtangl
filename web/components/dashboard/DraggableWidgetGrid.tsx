"use client";

import { useMemo, useState, type ReactNode } from "react";

import { ccFlags } from "@/lib/cc-feature-flags";
import { putDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export type WidgetGridItem = {
  id: string;
  label: string;
  node: ReactNode;
};

function applyOrder(items: WidgetGridItem[], order: string[]): WidgetGridItem[] {
  if (!order.length) return items;
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered: WidgetGridItem[] = [];
  for (const id of order) {
    const item = byId.get(id);
    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  }
  return [...ordered, ...byId.values()];
}

export default function DraggableWidgetGrid({
  items,
  initialOrder = [],
  tenantSettings,
  canWrite = true,
  onSettingsChange,
}: {
  items: WidgetGridItem[];
  initialOrder?: string[];
  tenantSettings?: Record<string, unknown> | null;
  canWrite?: boolean;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
}) {
  const ordered = useMemo(() => applyOrder(items, initialOrder), [items, initialOrder]);
  const [order, setOrder] = useState<string[]>(ordered.map((item) => item.id));
  const [dragId, setDragId] = useState<string | null>(null);

  const visible = useMemo(() => applyOrder(items, order), [items, order]);

  async function persist(nextOrder: string[]) {
    if (!canWrite) return;
    const next = { ...(tenantSettings ?? {}), dashboardLayout: { order: nextOrder } };
    try {
      await putDashboardJson("/tenant/settings", { settings: next });
      onSettingsChange?.(next);
    } catch {
      /* best-effort — order stays applied client-side */
    }
  }

  function reorder(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const current = visible.map((item) => item.id);
    const from = current.indexOf(dragId);
    const to = current.indexOf(targetId);
    if (from < 0 || to < 0) return;
    current.splice(to, 0, current.splice(from, 1)[0]);
    setOrder(current);
    setDragId(null);
    trackDashboardEvent({ event: "cc_widget_reordered", properties: { widgetId: dragId, toIndex: to } });
    void persist(current);
  }

  if (!ccFlags.widgetLayout) {
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id}>{item.node}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visible.map((item) => (
        <div
          key={item.id}
          draggable={canWrite}
          onDragStart={() => setDragId(item.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => reorder(item.id)}
          className={`group relative rounded-[var(--radius-xl)] ${dragId === item.id ? "opacity-60" : ""}`}
        >
          {canWrite ? (
            <span
              className="absolute right-2 top-2 z-10 cursor-grab select-none rounded px-1 text-[10px] text-[var(--color-gray-600)] opacity-0 transition group-hover:opacity-100"
              aria-hidden
              title={`Drag to reorder ${item.label}`}
            >
              ⠿
            </span>
          ) : null}
          {item.node}
        </div>
      ))}
    </div>
  );
}
