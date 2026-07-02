"use client";

import { useEffect, useState } from "react";

import { convertSectionNav } from "@/lib/copy/readiness-convert";

export default function ConvertAnchorNav() {
  const [active, setActive] = useState<string>(convertSectionNav[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

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
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.2, 0.45] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onScroll() {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      setProgress(max > 0 ? Math.min(1, scrollTop / max) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      className="sticky top-[4.5rem] z-30 border-b border-[var(--border-subtle)] bg-[var(--background)]/92 backdrop-blur-md sm:top-16"
    >
      <div
        className="h-0.5 bg-[var(--color-accent)]/80 transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[var(--container-wide)] px-[var(--gutter-mobile)] py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {convertSectionNav.map((item) => (
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
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--background)] to-transparent sm:hidden"
          aria-hidden
        />
      </div>
    </nav>
  );
}
