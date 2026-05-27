"use client";

import { useEffect, useState } from "react";

import { phaseRibbonItems } from "@/lib/copy/visualization";

type PhaseRibbonProps = {
  className?: string;
};

export default function PhaseRibbon({ className = "" }: PhaseRibbonProps) {
  const [activeId, setActiveId] = useState<string>(phaseRibbonItems[0].id);

  useEffect(() => {
    const sections = phaseRibbonItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) {
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
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const activeLabel =
    phaseRibbonItems.find((item) => item.id === activeId)?.label ?? phaseRibbonItems[0].label;

  return (
    <nav
      aria-label="Technology page sections"
      className={[
        "sticky top-20 z-20 -mx-[var(--gutter-mobile)] border-y border-[var(--border)] bg-[var(--background)]/92 px-[var(--gutter-mobile)] py-3 backdrop-blur-sm sm:-mx-[var(--gutter-tablet)] sm:px-[var(--gutter-tablet)] lg:top-24",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label mb-2 md:hidden">{activeLabel}</p>
      <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:gap-3">
        {phaseRibbonItems.map((item) => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                className={[
                  "inline-flex rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors",
                  isActive
                    ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
                    : "border-[var(--border)] text-[var(--color-gray-500)] hover:border-[var(--border-strong)] hover:text-[var(--color-gray-300)]",
                ].join(" ")}
                aria-current={isActive ? "location" : undefined}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
