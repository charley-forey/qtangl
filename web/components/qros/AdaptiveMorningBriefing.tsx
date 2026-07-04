"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { fetchMorningBriefing } from "@/lib/qros-api";
import type { MorningBriefing } from "@/lib/qros-types";

type Props = {
  persona: string;
};

export default function AdaptiveMorningBriefing({ persona }: Props) {
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMorningBriefing(persona)
      .then(setBriefing)
      .finally(() => setLoading(false));
  }, [persona]);

  if (loading) {
    return (
      <Card tone="panel" className="animate-pulse p-6">
        <div className="h-4 w-48 rounded bg-white/10" />
      </Card>
    );
  }

  if (!briefing) {
    return <EmptyState title="Briefing unavailable" description="Sign in and complete a scan to generate your briefing." />;
  }

  return (
    <Card tone="feature" className="p-5" data-tour="morning-briefing">
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--color-gray-500)]">
        Morning briefing · {briefing.persona}
      </p>
      <h2 className="mt-2 text-base font-semibold text-white">{briefing.headline}</h2>
      <ul className="mt-3 space-y-2 text-sm text-[var(--color-gray-300)]">
        {briefing.bullets.map((b) => (
          <li key={b}>• {b}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-[var(--color-gray-500)]">{briefing.methodNote}</p>
    </Card>
  );
}
