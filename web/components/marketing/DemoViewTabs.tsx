import Link from "next/link";

import { demosPageCopy } from "@/lib/copy/demos";

type DemoView = "catalog" | "sandbox";

type DemoViewTabsProps = {
  activeView: DemoView;
};

export default function DemoViewTabs({ activeView }: DemoViewTabsProps) {
  const tabs = [
    { id: "catalog" as const, label: demosPageCopy.tabs.catalog, href: "/demo" },
    {
      id: "sandbox" as const,
      label: demosPageCopy.tabs.sandbox,
      href: "/demo?view=sandbox",
    },
  ];

  return (
    <div
      className="flex flex-wrap gap-3"
      role="tablist"
      aria-label="Demo page views"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeView;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={[
              "rounded-full border px-4 py-2 text-sm transition",
              active
                ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
                : "border-[var(--border)] text-[var(--color-gray-300)] hover:border-[var(--border-strong)] hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
