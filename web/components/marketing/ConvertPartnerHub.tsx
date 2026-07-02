"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { convertPartnerNodes } from "@/lib/copy/readiness-demos";

export default function ConvertPartnerHub() {
  const [active, setActive] = useState(convertPartnerNodes[0].id);
  const node = convertPartnerNodes.find((n) => n.id === active) ?? convertPartnerNodes[0];

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Partner orchestration</Eyebrow>
      <p className="mt-3 text-sm text-[var(--color-gray-400)]">
        HSM, PKI, and SI introductions coordinated by Qtangl CS — not a self-serve marketplace yet.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {convertPartnerNodes.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setActive(n.id)}
            className={[
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              active === n.id
                ? "border-white/30 bg-white/10 text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
            ].join(" ")}
          >
            {n.label}
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-sm leading-7 text-[var(--color-gray-300)]">{node.blurb}</p>
    </Card>
  );
}
