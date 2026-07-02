"use client";

import Link from "next/link";

import { monitorPageCopy } from "@/lib/copy/readiness-monitor";

export default function MonitorAssessCompareStrip() {
  const { compareAssess } = monitorPageCopy;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[compareAssess.assess, compareAssess.monitor].map((col) => (
        <div
          key={col.title}
          className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/30 p-6"
        >
          <p className="text-label">{col.title}</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-gray-300)]">
            {col.points.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-[var(--color-gray-500)]">·</span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            href={col.href}
            className="mt-6 inline-flex rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            {col.cta} →
          </Link>
        </div>
      ))}
      <p className="md:col-span-2 text-sm">
        <a href={compareAssess.compareHref} className="text-white underline underline-offset-4">
          {compareAssess.compareLabel}
        </a>
      </p>
    </div>
  );
}
