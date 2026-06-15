"use client";

import { useEffect, useState } from "react";

export type CommandAction = {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
};

export default function DashboardCommandPalette({
  actions,
}: {
  actions: CommandAction[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

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

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-black p-4 shadow-2xl">
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
