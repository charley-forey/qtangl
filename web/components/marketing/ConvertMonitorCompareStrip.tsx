import Link from "next/link";

import { convertCompareMonitor } from "@/lib/copy/readiness-convert";

export default function ConvertMonitorCompareStrip() {
  const { monitor, convert, compareLabel, compareHref } = convertCompareMonitor;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[monitor, convert].map((col) => (
        <div
          key={col.title}
          className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/30 p-6 sm:p-8"
        >
          <p className="text-label">{col.title}</p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--color-gray-300)]">
            {col.points.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-[var(--color-gray-500)]">·</span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            href={col.href}
            className="mt-6 inline-flex rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm text-white transition hover:bg-white/5"
          >
            {col.cta} →
          </Link>
        </div>
      ))}
      <p className="text-sm md:col-span-2">
        <a href={compareHref} className="text-white underline underline-offset-4">
          {compareLabel}
        </a>
      </p>
    </div>
  );
}
