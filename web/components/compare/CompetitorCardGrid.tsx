import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { CompetitorEntry } from "@/lib/competitors-types";
import { TIER_LABELS } from "@/lib/competitors-types";
import { competitorCompareHref } from "@/lib/copy/competitors";

type CompetitorCardGridProps = {
  competitors: CompetitorEntry[];
};

export default function CompetitorCardGrid({ competitors }: CompetitorCardGridProps) {
  const byTier = competitors.reduce(
    (acc, c) => {
      const tier = c.tier;
      if (!acc[tier]) acc[tier] = [];
      acc[tier]!.push(c);
      return acc;
    },
    {} as Partial<Record<CompetitorEntry["tier"], CompetitorEntry[]>>,
  );

  const tierOrder: CompetitorEntry["tier"][] = [
    "direct-platform",
    "pure-play",
    "clm-pki",
    "consulting",
    "open-source",
    "status-quo",
  ];

  return (
    <div className="space-y-10">
      {tierOrder.map((tier) => {
        const items = byTier[tier];
        if (!items?.length) return null;
        return (
          <section key={tier}>
            <Eyebrow>{TIER_LABELS[tier]}</Eyebrow>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <Card
                  key={c.slug}
                  as={Link}
                  href={competitorCompareHref(c.slug)}
                  interactive
                  tone="panel"
                  size="md"
                  className="rounded-[var(--radius-xl)]"
                >
                  <p className="text-label text-[var(--color-gray-500)]">{c.product}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">Qtangl vs {c.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-gray-400)]">{c.oneLiner}</p>
                  <p className="mt-4 text-xs text-white">Read comparison →</p>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
