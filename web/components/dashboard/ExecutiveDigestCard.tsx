"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export type WeeklyDigest = {
  headline: string;
  wins: string[];
  risks: string[];
  nextWeekFocus: string[];
  sinceLastBoardMeeting?: string;
  topCryptoRisks?: string[];
  narrative?: string;
};

export default function ExecutiveDigestCard({ digest }: { digest: WeeklyDigest | null }) {
  const [expanded, setExpanded] = useState(false);

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
      {digest.narrative ? <p className="mt-2 text-xs text-[var(--color-gray-400)]">{digest.narrative}</p> : null}
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
