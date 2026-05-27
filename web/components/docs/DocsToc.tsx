"use client";

import { useEffect, useState } from "react";

import { useDocsContext } from "@/lib/docs/context";

export default function DocsToc() {
  const { toc } = useDocsContext();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!toc.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (el) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) {
    return null;
  }

  return (
    <nav aria-label="On this page" className="docs-toc hidden xl:block">
      <p className="text-label">On this page</p>
      <ul className="mt-4 space-y-2 border-l border-[var(--border)] pl-3">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={[
                "block text-sm leading-6 transition",
                item.level === 3 ? "pl-3" : "",
                activeId === item.id
                  ? "border-l border-white pl-2 text-white"
                  : "text-[var(--color-gray-500)] hover:text-[var(--color-gray-300)]",
              ].join(" ")}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DocsTocMobile() {
  const { toc } = useDocsContext();

  if (!toc.length) {
    return null;
  }

  return (
    <details className="docs-toc-mobile xl:hidden rounded-2xl border border-[var(--border)] bg-black/30 px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium text-white">
        On this page
      </summary>
      <ul className="mt-3 space-y-2 text-sm text-[var(--color-gray-400)]">
        {toc.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
            <a href={`#${item.id}`} className="hover:text-white">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
