"use client";

import { useEffect, useState } from "react";

import CodeBlock from "@/components/docs/CodeBlock";
import type { DocsCodeLanguage } from "@/lib/docs/types";

type Tab = {
  id: DocsCodeLanguage;
  label: string;
  code: string | object;
};

type DocsCodeTabsProps = {
  tabs: Tab[];
  storageKey?: string;
};

export default function DocsCodeTabs({ tabs, storageKey = "qtangl-docs-code-tab" }: DocsCodeTabsProps) {
  const [active, setActive] = useState<Tab["id"]>(tabs[0]?.id ?? "curl");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as DocsCodeLanguage | null;
    if (saved && tabs.some((tab) => tab.id === saved)) {
      setActive(saved);
    }
  }, [storageKey, tabs]);

  function select(id: DocsCodeLanguage) {
    setActive(id);
    window.localStorage.setItem(storageKey, id);
  }

  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Code examples">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => select(tab.id)}
            className={[
              "touch-target rounded-full border px-3 py-1.5 text-xs transition",
              active === tab.id
                ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {current ? <CodeBlock title={current.label} code={current.code} /> : null}
    </div>
  );
}
