"use client";

import { useEffect } from "react";

import type { DemoScene } from "@/lib/demo";

const HOTKEYS = ["1", "2", "3", "4", "5"];

export default function DirectorDeck({
  scenes,
  onApply,
  busy,
}: {
  scenes: DemoScene[];
  onApply: (sceneId: string) => void | Promise<void>;
  busy?: boolean;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      const idx = HOTKEYS.indexOf(event.key);
      if (idx >= 0 && scenes[idx]) {
        event.preventDefault();
        void onApply(scenes[idx].id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onApply, scenes]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {scenes.map((scene, index) => (
        <button
          key={scene.id}
          type="button"
          disabled={busy}
          onClick={() => void onApply(scene.id)}
          className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-500/5 disabled:opacity-50"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-cyan-300/80">
            Scene {index + 1}
          </span>
          <p className="mt-1 font-semibold text-white">{scene.title}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-gray-400)]">{scene.description}</p>
        </button>
      ))}
    </div>
  );
}
