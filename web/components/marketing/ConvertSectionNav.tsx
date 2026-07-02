"use client";

import { useEffect, useState } from "react";

import { convertSectionNav } from "@/lib/copy/readiness-convert";

export default function ConvertSectionNav() {
  const [active, setActive] = useState<string>(convertSectionNav[0].id);

  useEffect(() => {
    const sections = convertSectionNav
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
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
      aria-label="Convert page sections"
      className="sticky top-[4.5rem] z-20 -mx-4 border-b border-[var(--border-subtle)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur-md sm:top-16"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {convertSectionNav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={[
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
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
