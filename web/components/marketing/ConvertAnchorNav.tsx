"use client";

import { useEffect, useState } from "react";

import { convertSectionNav } from "@/lib/copy/readiness-convert";

export default function ConvertAnchorNav() {
  const [active, setActive] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("convert-anchor-sentinel");
    if (!sentinel) return;

    const pinObserver = new IntersectionObserver(
      ([entry]) => setPinned(!entry.isIntersecting),
      // IntersectionObserver only accepts px or % in rootMargin (not rem).
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    pinObserver.observe(sentinel);
    return () => pinObserver.disconnect();
  }, []);

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
      { rootMargin: "-22% 0px -58% 0px", threshold: [0, 0.2, 0.45] }
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
    <>
      <div id="convert-anchor-sentinel" className="h-px w-full" aria-hidden />
      <nav
        aria-label="Convert page sections"
        className={[
          "z-20 transition-[box-shadow,background] duration-300",
          pinned
            ? "sticky top-[4.5rem] -mx-[var(--gutter-mobile)] border-b border-[var(--border-subtle)] bg-[var(--background)]/95 px-[var(--gutter-mobile)] py-2.5 backdrop-blur-md sm:top-16"
            : "relative",
        ].join(" ")}
      >
        {pinned ? (
          <div
            className="absolute inset-x-0 top-0 h-0.5 bg-[var(--color-accent)]/70 transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
            aria-hidden
          />
        ) : null}
        <div
          className={[
            "relative",
            pinned
              ? "mx-auto max-w-[var(--container-wide)]"
              : "rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/30 px-4 py-3 sm:px-5",
          ].join(" ")}
        >
          {!pinned ? (
            <p className="mb-2.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              On this page
            </p>
          ) : null}
          <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <div
            className={[
              "pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l to-transparent sm:hidden",
              pinned ? "from-[var(--background)]" : "from-black/30",
            ].join(" ")}
            aria-hidden
          />
        </div>
      </nav>
    </>
  );
}
