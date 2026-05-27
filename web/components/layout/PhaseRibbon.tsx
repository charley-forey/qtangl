"use client";

import { useEffect, useState } from "react";

import { phaseRibbonGroupsMobile, phaseRibbonItems } from "@/lib/copy/visualization";

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
    phaseRibbonItems.find((item) => item.id === activeId)?.label ??
    phaseRibbonGroupsMobile.find((item) => item.id === activeId)?.label ??
    phaseRibbonItems[0].label;

  const renderLink = (id: string, label: string) => {
    const isActive = itemMatchesActive(id, activeId);

    return (
      <li key={id} className="shrink-0">
        <a
          href={`#${id}`}
          className={[
            "touch-target inline-flex min-h-[2.75rem] items-center rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors",
            isActive
              ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
              : "border-[var(--border)] text-[var(--color-gray-500)] hover:border-[var(--border-strong)] hover:text-[var(--color-gray-300)]",
          ].join(" ")}
          aria-current={isActive ? "location" : undefined}
        >
          {label}
        </a>
      </li>
    );
  };

  return (
    <div
      className={[
        "sticky top-20 z-20 border-y border-[var(--border)] bg-[var(--background)]/92 backdrop-blur-sm lg:top-24",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto w-full max-w-[var(--container-wide)] px-[var(--gutter-mobile)] py-3 sm:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
        <p className="text-label mb-2 md:hidden">{activeLabel}</p>

        <nav aria-label="Technology page sections">
          <ul className="tech-scroll-fade hidden gap-2 overflow-x-auto pb-1 md:flex md:flex-wrap md:gap-3">
            {phaseRibbonItems.map((item) => renderLink(item.id, item.label))}
          </ul>

          <ul className="tech-scroll-fade flex gap-2 overflow-x-auto pb-1 md:hidden">
            {phaseRibbonGroupsMobile.map((item) => renderLink(item.id, item.label))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function itemMatchesActive(linkId: string, activeId: string) {
  if (linkId === activeId) {
    return true;
  }

  const groups: Record<string, string[]> = {
    pipeline: ["pipeline", "phases"],
    "hybrid-stack": ["hybrid-stack", "honesty", "interference", "comparison"],
    contract: ["contract", "latency", "lexicon", "decoherence"],
    preview: ["preview", "platform", "workflow"],
    "use-cases": ["use-cases"],
  };

  return groups[linkId]?.includes(activeId) ?? false;
}
