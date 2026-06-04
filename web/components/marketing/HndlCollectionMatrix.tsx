"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { hndlCollectionVectors } from "@/lib/copy/hndl-data";
import { trackEvent } from "@/lib/analytics";

const likelihoodLabel = {
  high: "High",
  medium: "Medium",
  low: "Lower",
} as const;

const likelihoodClass = {
  high: "text-[#6ee7a0]",
  medium: "text-[#fbbf24]",
  low: "text-[var(--color-gray-400)]",
} as const;

export default function HndlCollectionMatrix() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Collection vectors</Eyebrow>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        How adversaries copy ciphertext today — without breaking encryption. Select a row for details.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">
            HNDL collection vectors showing likelihood and what adversaries store
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--color-gray-500)]">
              <th scope="col" className="pb-3 pr-4 font-medium">
                Vector
              </th>
              <th scope="col" className="pb-3 pr-4 font-medium">
                Likelihood
              </th>
              <th scope="col" className="pb-3 font-medium">
                What is stored
              </th>
            </tr>
          </thead>
          <tbody>
            {hndlCollectionVectors.map((vector) => {
              const isOpen = expanded === vector.id;
              return (
                <tr
                  key={vector.id}
                  className="border-b border-[var(--border)]/60 cursor-pointer hover:bg-white/[0.02]"
                  onClick={() => {
                    const next = isOpen ? null : vector.id;
                    setExpanded(next);
                    if (next) {
                      trackEvent("hndl_vector_expand", { vector: vector.id });
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      const next = isOpen ? null : vector.id;
                      setExpanded(next);
                      if (next) {
                        trackEvent("hndl_vector_expand", { vector: vector.id });
                      }
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isOpen}
                >
                  <td className="py-4 pr-4 font-medium text-white">{vector.label}</td>
                  <td className={`py-4 pr-4 ${likelihoodClass[vector.likelihood]}`}>
                    {likelihoodLabel[vector.likelihood]}
                  </td>
                  <td className="py-4 text-[var(--color-gray-300)]">
                    {isOpen ? vector.whatIsStored : `${vector.whatIsStored.slice(0, 48)}…`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
