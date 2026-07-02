"use client";

import { useEffect, useState } from "react";

import AnimatedBorderFrame from "@/components/ui/AnimatedBorderFrame";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const STAGES = [
  {
    id: "before",
    label: "Before",
    color: "border-red-500/50 bg-red-950/20",
    items: ["RSA / ECDH everywhere", "Unknown inventory", "Ciphertext harvestable"],
    note: "Previously harvested ciphertext cannot be un-copied; migration protects new data.",
  },
  {
    id: "during",
    label: "During",
    color: "border-amber-500/50 bg-amber-950/20",
    items: ["CBOM + prioritized backlog", "Hybrid TLS pilot", "Mosca-scored waves"],
    note: "Convert tracks owners, target dates, and verify-fix per item.",
  },
  {
    id: "after",
    label: "After",
    color: "border-emerald-500/50 bg-emerald-950/20",
    items: ["ML-KEM hybrid live", "Signed verify proof", "Re-scan diff attached"],
    note: "Verification confirms signing and report integrity — not complete estate coverage.",
  },
] as const;

const ROLES = [
  { role: "GRC", action: "Export auditor pack" },
  { role: "Platform", action: "Hybrid TLS pilot" },
  { role: "Security", action: "Verify-fix loop" },
];

type StageId = (typeof STAGES)[number]["id"];

export default function ConvertMigrationDiagram() {
  const [active, setActive] = useState<StageId>("before");
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual) return;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const observers: IntersectionObserver[] = [];
    STAGES.forEach((stage, index) => {
      const el = document.getElementById(`migration-stage-${stage.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setActive(STAGES[index].id);
          }
        },
        { rootMargin: "-10% 0px -55% 0px", threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [manual]);

  return (
    <AnimatedBorderFrame className="overflow-hidden rounded-[var(--radius-feature)]">
      <Card
        tone="feature"
        size="lg"
        className="rounded-[var(--radius-feature)] border-0 bg-transparent"
        role="img"
        aria-label="PQC migration path: before inventory with harvestable ciphertext, during hybrid TLS pilot with prioritized backlog, after signed verify proof and re-scan diff"
      >
        <Eyebrow>Migration path</Eyebrow>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-gray-400)]">
          Reduce HNDL exposure with a phased program — inventory, hybrid pilot, signed proof.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                setManual(true);
                setActive(stage.id);
              }}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium",
                active === stage.id
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-[var(--border)] text-[var(--color-gray-400)]",
              ].join(" ")}
            >
              {stage.label}
            </button>
          ))}
        </div>

        <div className="relative mt-8 hidden lg:block">
          <div className="grid grid-cols-3 gap-6">
            {STAGES.map((stage, index) => (
              <div key={stage.id} className="relative">
                {index < STAGES.length - 1 ? (
                  <span
                    className="pointer-events-none absolute right-[-1.25rem] top-1/2 z-10 hidden -translate-y-1/2 text-2xl text-[var(--color-gray-600)] lg:inline"
                    aria-hidden
                  >
                    →
                  </span>
                ) : null}
                <div
                  id={`migration-stage-${stage.id}`}
                  className={[
                    "h-full rounded-xl border-2 p-8 transition duration-500",
                    stage.color,
                    active === stage.id ? "ring-2 ring-white/20" : "opacity-70",
                  ].join(" ")}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-400)]">
                    {stage.label}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {stage.items.map((item) => (
                      <li key={item} className="text-sm text-white">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs leading-6 text-[var(--color-gray-500)]">{stage.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4 lg:hidden">
          {STAGES.filter((s) => s.id === active).map((stage) => (
            <div key={stage.id} className={["rounded-xl border-2 p-8", stage.color].join(" ")}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em]">{stage.label}</p>
              <ul className="mt-3 space-y-2">
                {stage.items.map((item) => (
                  <li key={item} className="text-sm text-white">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--color-gray-500)]">{stage.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {ROLES.map((r) => (
            <div
              key={r.role}
              className="rounded-lg border border-[var(--border-subtle)] bg-black/30 px-4 py-3 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gray-500)]">
                {r.role}
              </p>
              <p className="mt-1 text-sm text-white">{r.action}</p>
            </div>
          ))}
        </div>
      </Card>
    </AnimatedBorderFrame>
  );
}
