"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  convertPreviewBaseline,
  convertPreviewItems,
} from "@/lib/copy/readiness-demos";

export type ConvertEvidenceTab = "diff" | "auditor" | "verify" | "pdf" | "jira";

type ConvertDemoContextValue = {
  selected: Set<string>;
  toggle: (id: string) => void;
  waveFilter: "all" | 1 | 2 | 3;
  setWaveFilter: (wave: "all" | 1 | 2 | 3) => void;
  evidenceTab: ConvertEvidenceTab;
  setEvidenceTab: (tab: ConvertEvidenceTab) => void;
  projectedScore: number;
  scoreFlash: boolean;
};

const ConvertDemoContext = createContext<ConvertDemoContextValue | null>(null);

export function useConvertDemo() {
  const ctx = useContext(ConvertDemoContext);
  if (!ctx) throw new Error("useConvertDemo must be used within ConvertDemoProvider");
  return ctx;
}

export function ConvertDemoProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["rem_001", "rem_002"]));
  const [waveFilter, setWaveFilter] = useState<"all" | 1 | 2 | 3>("all");
  const [evidenceTab, setEvidenceTab] = useState<ConvertEvidenceTab>("diff");
  const [scoreFlash, setScoreFlash] = useState(false);

  const projectedScore = useMemo(() => {
    const selectedImpact = convertPreviewItems
      .filter((item) => selected.has(item.id))
      .reduce((sum, item) => sum + item.impactPoints, 0);
    return Math.min(100, convertPreviewBaseline.currentScore + selectedImpact);
  }, [selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setScoreFlash(true);
    window.setTimeout(() => setScoreFlash(false), 600);
  }

  return (
    <ConvertDemoContext.Provider
      value={{
        selected,
        toggle,
        waveFilter,
        setWaveFilter,
        evidenceTab,
        setEvidenceTab,
        projectedScore,
        scoreFlash,
      }}
    >
      {children}
    </ConvertDemoContext.Provider>
  );
}
