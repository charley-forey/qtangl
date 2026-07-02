"use client";

import { useEffect, useState } from "react";

import { monitorPageCopy } from "@/lib/copy/readiness-monitor";

export default function MonitorAnchorNav() {
  const { sectionNav } = monitorPageCopy;
  const [active, setActive] = useState<string>(sectionNav[0]?.id ?? "");

  useEffect(() => {
    const sections = sectionNav
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.2, 0.45] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionNav]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setActive(id);
  }

  return (
    <nav
      aria-label="Monitor page sections"
      className="sticky top-[4.5rem] z-30 border-b border-[var(--border-subtle)] bg-[var(--background)]/92 backdrop-blur-md sm:top-16"
    >
      <div className="mx-auto flex max-w-[var(--container-wide)] gap-2 overflow-x-auto px-[var(--gutter-mobile)] py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sectionNav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={[
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              active === item.id
                ? "border-white/30 bg-white/10 text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:border-[var(--border-strong)] hover:text-white",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
