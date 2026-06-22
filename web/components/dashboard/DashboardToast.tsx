"use client";

import { useEffect } from "react";

type Props = {
  message: string | null;
  tone?: "success" | "error" | "info";
  onDismiss?: () => void;
  durationMs?: number;
};

export default function DashboardToast({
  message,
  tone = "info",
  onDismiss,
  durationMs = 5000,
}: Props) {
  useEffect(() => {
    if (!message || !onDismiss) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  const toneClass =
    tone === "error"
      ? "border-red-500/40 bg-red-500/15 text-red-100"
      : tone === "success"
        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
        : "border-[var(--border-strong)] bg-black/90 text-white";

  return (
    <div
      className={`fixed left-1/2 top-20 z-[70] max-w-md -translate-x-1/2 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur sm:top-24 ${toneClass}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
