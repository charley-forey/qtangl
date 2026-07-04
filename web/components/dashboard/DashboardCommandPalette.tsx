"use client";

import { useEffect, useRef, useState } from "react";

import { ccFlags } from "@/lib/cc-feature-flags";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";
import type { SavedView, SavedViewFilters } from "@/lib/saved-views";

export type CommandAction = {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
};

export default function DashboardCommandPalette({
  actions,
  filterActions = [],
  onApplySavedView,
}: {
  actions: CommandAction[];
  filterActions?: CommandAction[];
  onApplySavedView?: (filters: SavedViewFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !ccFlags.savedViews || savedViews.length > 0) return;
    void fetchDashboardJson<{ views: SavedView[] }>("/tenant/saved-views")
      .then((data) => setSavedViews(data.views))
      .catch(() => setSavedViews([]));
  }, [open, savedViews.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    function trap(e: KeyboardEvent) {
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [open]);

  const savedViewActions: CommandAction[] = savedViews.map((view) => ({
    id: `saved-view-${view.id}`,
    label: `View: ${view.name}`,
    onSelect: () => {
      onApplySavedView?.(view.filters);
      trackDashboardEvent({ event: "cc_saved_view_applied", properties: { viewId: view.id } });
    },
  }));

  const combined = [...filterActions, ...savedViewActions, ...actions];
  const filtered = combined.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--color-gray-400)] md:inline-flex"
      >
        ⌘K
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-black p-4 shadow-2xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions…"
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-black px-4 py-3 text-sm text-white"
        />
        <ul className="mt-3 max-h-64 overflow-y-auto">
          {filtered.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                onClick={() => {
                  action.onSelect?.();
                  if (action.href) window.location.hash = action.href.replace("#", "");
                  setOpen(false);
                  setQuery("");
                }}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
