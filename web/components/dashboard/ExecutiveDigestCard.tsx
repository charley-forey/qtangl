"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { ccFlags } from "@/lib/cc-feature-flags";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export type WeeklyDigest = {
  headline: string;
  wins: string[];
  risks: string[];
  nextWeekFocus: string[];
  sinceLastBoardMeeting?: string;
  topCryptoRisks?: string[];
  narrative?: string;
};

type AiCitation = { kind: string; ref: string; label: string };

type ExecutiveNarrative = {
  narrative: string;
  citations?: AiCitation[];
  confidence?: "low" | "medium" | "high";
  assumptions?: string[];
};

export default function ExecutiveDigestCard({ digest }: { digest: WeeklyDigest | null }) {
  const [expanded, setExpanded] = useState(false);
  const [narrative, setNarrative] = useState<ExecutiveNarrative | null>(null);

  useEffect(() => {
    if (!ccFlags.v2 || !digest) return;
    void fetchDashboardJson<ExecutiveNarrative>("/tenant/ai/executive-narrative")
      .then((data) => {
        if (!data?.narrative) return;
        setNarrative(data);
        trackDashboardEvent({
          event: "cc_executive_narrative_viewed",
          properties: { confidence: data.confidence ?? "medium" },
        });
      })
      .catch(() => setNarrative(null));
  }, [digest]);

  if (!digest) {
    return null;
  }

  async function copyDigest() {
    if (!digest) return;
    const text = [
      digest.headline,
      digest.narrative ?? "",
      digest.sinceLastBoardMeeting ?? "",
      "Wins:",
      ...digest.wins,
      "Risks:",
      ...digest.risks,
      "Top crypto risks:",
      ...(digest.topCryptoRisks ?? []),
      "Next week:",
      ...digest.nextWeekFocus,
    ].join("\n");
    await navigator.clipboard.writeText(text);
  }

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow>Executive digest</Eyebrow>
        <div className="flex gap-2">
          <button type="button" className="text-xs text-sky-400 underline" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Collapse" : "Expand"}
          </button>
          <button type="button" className="text-xs text-sky-400 underline" onClick={() => void copyDigest()}>
            Copy
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-white">{digest.headline}</p>
      {narrative ? (
        <div className="mt-2 rounded-lg border border-[var(--border-subtle)] bg-black/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-gray-500)]">AI narrative</span>
            <span className="text-[10px] uppercase tracking-wider text-sky-300">{narrative.confidence ?? "medium"} confidence</span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-gray-300)]">{narrative.narrative}</p>
          {(narrative.citations ?? []).length > 0 ? (
            <p className="mt-2 flex flex-wrap gap-1">
              {narrative.citations?.map((c) => (
                <span key={`${c.kind}-${c.ref}`} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--color-gray-400)]">
                  {c.label}
                </span>
              ))}
            </p>
          ) : null}
          {(narrative.assumptions ?? []).length > 0 ? (
            <p className="mt-2 text-[10px] italic text-[var(--color-gray-500)]">{narrative.assumptions?.join(" ")}</p>
          ) : null}
        </div>
      ) : digest.narrative ? (
        <p className="mt-2 text-xs text-[var(--color-gray-400)]">{digest.narrative}</p>
      ) : null}
      {digest.sinceLastBoardMeeting ? (
        <p className="mt-2 text-xs italic text-[var(--color-gray-500)]">{digest.sinceLastBoardMeeting}</p>
      ) : null}
      {(expanded || digest.wins.length > 0) && digest.wins.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-emerald-300/90">Wins</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-[var(--color-gray-400)]">
            {digest.wins.map((win) => (
              <li key={win}>{win}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {(expanded || digest.risks.length > 0) && digest.risks.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-amber-200/90">Risks</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-[var(--color-gray-400)]">
            {digest.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {expanded && (digest.topCryptoRisks?.length ?? 0) > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-red-200/90">Top crypto risks</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-[var(--color-gray-400)]">
            {digest.topCryptoRisks?.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {(expanded || digest.nextWeekFocus.length > 0) && digest.nextWeekFocus.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-sky-200/90">Next week</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-[var(--color-gray-400)]">
            {digest.nextWeekFocus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
