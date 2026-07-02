"use client";

import Link from "next/link";

import { monitorPageCopy } from "@/lib/copy/readiness-monitor";

export default function MonitorAnchorNav() {
  return (
    <nav
      aria-label="Monitor page sections"
      className="sticky top-16 z-30 hidden border-b border-[var(--border-subtle)] bg-black/80 py-3 backdrop-blur-md lg:block"
    >
      <div className="mx-auto flex max-w-[var(--container-wide)] flex-wrap gap-2">
        {monitorPageCopy.anchorNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-400)] transition hover:border-[var(--border-strong)] hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
