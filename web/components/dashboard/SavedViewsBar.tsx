"use client";

import { useEffect, useState } from "react";

import { ccFlags } from "@/lib/cc-feature-flags";
import { deleteDashboardJson, fetchDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export type SavedViewFilters = {
  tab?: string | null;
  severity?: string | null;
  businessUnit?: string | null;
  scanSource?: string | null;
  query?: string | null;
  extra?: Record<string, unknown>;
};

export type SavedView = {
  id: string;
  name: string;
  persona?: string | null;
  filters: SavedViewFilters;
  createdAt: string;
  updatedAt: string;
};

type SavedViewListResponse = { views: SavedView[] };

function makeId(): string {
  return `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function SavedViewsBar({
  currentFilters,
  persona,
  onApply,
  canWrite = true,
}: {
  currentFilters?: SavedViewFilters;
  persona?: string;
  onApply?: (filters: SavedViewFilters) => void;
  canWrite?: boolean;
}) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!ccFlags.savedViews) return;
    void fetchDashboardJson<SavedViewListResponse>("/tenant/saved-views")
      .then((data) => setViews(data.views))
      .catch(() => setViews([]));
  }, []);

  if (!ccFlags.savedViews) return null;

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const viewId = makeId();
    try {
      const data = await putDashboardJson<SavedViewListResponse>(`/tenant/saved-views/${viewId}`, {
        name: trimmed,
        persona: persona ?? null,
        filters: currentFilters ?? {},
      });
      setViews(data.views);
      setName("");
      setNaming(false);
      trackDashboardEvent({ event: "cc_saved_view_saved", properties: { viewId } });
    } catch {
      /* best-effort */
    }
  }

  async function remove(viewId: string) {
    try {
      await deleteDashboardJson(`/tenant/saved-views/${encodeURIComponent(viewId)}`);
      setViews((prev) => prev.filter((v) => v.id !== viewId));
      trackDashboardEvent({ event: "cc_saved_view_deleted", properties: { viewId } });
    } catch {
      /* best-effort */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Views</span>
      {views.map((view) => (
        <span
          key={view.id}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] px-2 py-1"
        >
          <button
            type="button"
            className="text-sky-300 hover:underline"
            onClick={() => {
              onApply?.(view.filters);
              trackDashboardEvent({ event: "cc_saved_view_applied", properties: { viewId: view.id } });
            }}
          >
            {view.name}
          </button>
          {canWrite ? (
            <button
              type="button"
              aria-label={`Delete ${view.name}`}
              className="text-[var(--color-gray-500)] hover:text-red-300"
              onClick={() => void remove(view.id)}
            >
              ×
            </button>
          ) : null}
        </span>
      ))}
      {canWrite ? (
        naming ? (
          <span className="inline-flex items-center gap-1">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
                if (e.key === "Escape") setNaming(false);
              }}
              placeholder="View name"
              className="w-32 rounded-full border border-[var(--border-subtle)] bg-black/60 px-2 py-1 text-white"
            />
            <button type="button" className="text-emerald-300 hover:underline" onClick={() => void save()}>
              Save
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="rounded-full border border-dashed border-[var(--border-subtle)] px-2 py-1 text-[var(--color-gray-400)] hover:text-white"
            onClick={() => setNaming(true)}
          >
            + Save current
          </button>
        )
      ) : null}
    </div>
  );
}
