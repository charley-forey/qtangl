"use client";

export default function NarrationTicker({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300/80">Live narration</p>
      <p className="mt-1 text-sm leading-6 text-[var(--color-gray-200)]">{text}</p>
    </div>
  );
}
