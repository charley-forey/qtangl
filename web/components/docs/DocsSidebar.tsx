"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import DocsBadge from "@/components/docs/DocsBadge";
import { docsSections } from "@/lib/docs/nav";
import type { DocsFeatureStatus } from "@/lib/docs/types";

type DocsSidebarProps = {
  onNavigate?: () => void;
};

function initialCollapsedState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const section of docsSections) {
    if (section.defaultCollapsed) {
      state[section.id] = true;
    }
  }
  return state;
}

export default function DocsSidebar({ onNavigate }: DocsSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(initialCollapsedState);

  function toggleSection(id: string) {
    setCollapsed((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <nav className="docs-sidebar space-y-6" aria-label="Documentation">
      {docsSections.map((section) => {
        const isOpen = !collapsed[section.id];
        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gray-500)]"
              aria-expanded={isOpen}
            >
              {section.title}
              <span className="text-[var(--color-gray-600)]">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen ? (
              <ul className="mt-3 space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={[
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition",
                          active
                            ? "border-[var(--border-strong)] bg-white/[0.06] text-white"
                            : "border-transparent text-[var(--color-gray-300)] hover:border-[var(--border)] hover:bg-white/[0.04] hover:text-white",
                        ].join(" ")}
                        aria-current={active ? "page" : undefined}
                      >
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        {item.status && item.status !== "ga" ? (
                          <DocsBadge
                            status={item.status as DocsFeatureStatus}
                            className="!px-1.5 !py-0 !text-[0.55rem]"
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
