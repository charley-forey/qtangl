"use client";

import Link from "next/link";

import { qtanglApiBaseUrl } from "@/lib/api";
import type { SandboxLiveStatus } from "@/lib/optimize";
import { sandboxStatusCopy } from "@/lib/copy/try";

type SandboxStatusBarProps = {
  status: SandboxLiveStatus;
  isLoading?: boolean;
};

const statusStyles: Record<SandboxLiveStatus, string> = {
  preview: "border-[var(--border)] bg-white/[0.04] text-[var(--color-gray-300)]",
  live: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  fallback: "border-amber-500/40 bg-amber-500/10 text-amber-200",
};

export default function SandboxStatusBar({ status, isLoading = false }: SandboxStatusBarProps) {
  const displayStatus = isLoading ? "preview" : status;

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={[
            "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.12em]",
            statusStyles[displayStatus],
          ].join(" ")}
          aria-live="polite"
        >
          {isLoading
            ? "Calling…"
            : sandboxStatusCopy.statuses[displayStatus]}
        </span>
        <span className="font-mono text-sm text-white">{sandboxStatusCopy.endpoint}</span>
        <span className="hidden text-sm text-[var(--color-gray-500)] sm:inline">·</span>
        <span className="font-mono text-xs text-[var(--color-gray-400)] sm:text-sm">
          {qtanglApiBaseUrl}
        </span>
      </div>
      <Link
        href={sandboxStatusCopy.accessLink.href}
        className="text-sm text-white underline-offset-4 hover:underline"
      >
        {sandboxStatusCopy.accessLink.label} →
      </Link>
    </div>
  );
}
