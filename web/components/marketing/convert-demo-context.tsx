"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  convertPreviewBaseline,
  convertPreviewItems,
} from "@/lib/copy/readiness-demos";

export type ConvertEvidenceTab = "diff" | "auditor" | "verify" | "pdf" | "jira";

const DEFAULT_SELECTED = new Set(["rem_001", "rem_002"]);
const WAVE1_IDS = convertPreviewItems.filter((i) => i.wave === 1).map((i) => i.id);

type ConvertDemoContextValue = {
  selected: Set<string>;
  toggle: (id: string) => void;
  waveFilter: "all" | 1 | 2 | 3;
  setWaveFilter: (wave: "all" | 1 | 2 | 3) => void;
  evidenceTab: ConvertEvidenceTab;
  setEvidenceTab: (tab: ConvertEvidenceTab) => void;
  projectedScore: number;
  scoreFlash: boolean;
  resetDemo: () => void;
  applyWave1Preset: () => void;
  demoNotice: string | null;
  clearDemoNotice: () => void;
  remediatedCount: number;
};

const ConvertDemoContext = createContext<ConvertDemoContextValue | null>(null);

export function useConvertDemo() {
  const ctx = useContext(ConvertDemoContext);
  if (!ctx) throw new Error("useConvertDemo must be used within ConvertDemoProvider");
  return ctx;
}

export function ConvertDemoProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(DEFAULT_SELECTED));
  const [waveFilter, setWaveFilter] = useState<"all" | 1 | 2 | 3>("all");
  const [evidenceTab, setEvidenceTab] = useState<ConvertEvidenceTab>("diff");
  const [scoreFlash, setScoreFlash] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const projectedScore = useMemo(() => {
    const selectedImpact = convertPreviewItems
      .filter((item) => selected.has(item.id))
      .reduce((sum, item) => sum + item.impactPoints, 0);
    return Math.min(100, convertPreviewBaseline.currentScore + selectedImpact);
  }, [selected]);

  const remediatedCount = useMemo(
    () => convertPreviewItems.filter((item) => selected.has(item.id) && item.assetId).length,
    [selected]
  );

  const flashScore = useCallback(() => {
    setScoreFlash(true);
    window.setTimeout(() => setScoreFlash(false), 600);
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    flashScore();
  }

  function resetDemo() {
    setSelected(new Set(DEFAULT_SELECTED));
    setWaveFilter("all");
    setEvidenceTab("diff");
    setDemoNotice("Demo reset to default selection.");
    flashScore();
  }

  function applyWave1Preset() {
    setSelected(new Set(WAVE1_IDS));
    setWaveFilter(1);
    setDemoNotice(`Wave 1 preset: ${WAVE1_IDS.length} edge TLS items selected.`);
    flashScore();
  }

  function clearDemoNotice() {
    setDemoNotice(null);
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
        resetDemo,
        applyWave1Preset,
        demoNotice,
        clearDemoNotice,
        remediatedCount,
      }}
    >
      {children}
    </ConvertDemoContext.Provider>
  );
}
