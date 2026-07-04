"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { trackDashboardEvent } from "@/lib/dashboard-telemetry";
import type { GlobalLens } from "@/lib/qros-types";
import { EMPTY_LENS } from "@/lib/qros-types";

type LensContextValue = {
  lens: GlobalLens;
  setLens: (patch: Partial<GlobalLens>) => void;
  resetLens: () => void;
  applySavedView: (filters: Partial<GlobalLens>, viewId: string) => void;
};

const LensContext = createContext<LensContextValue | null>(null);

export function QrosLensProvider({ children }: { children: ReactNode }) {
  const [lens, setLensState] = useState<GlobalLens>(EMPTY_LENS);

  const setLens = useCallback((patch: Partial<GlobalLens>) => {
    setLensState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetLens = useCallback(() => {
    setLensState(EMPTY_LENS);
  }, []);

  const applySavedView = useCallback((filters: Partial<GlobalLens>, viewId: string) => {
    setLensState({ ...EMPTY_LENS, ...filters });
    trackDashboardEvent({ event: "cc_qros_lens_applied", properties: { viewId } });
  }, []);

  const value = useMemo(
    () => ({ lens, setLens, resetLens, applySavedView }),
    [lens, setLens, resetLens, applySavedView]
  );

  return <LensContext.Provider value={value}>{children}</LensContext.Provider>;
}

export function useQrosLens() {
  const ctx = useContext(LensContext);
  if (!ctx) {
    return {
      lens: EMPTY_LENS,
      setLens: () => {},
      resetLens: () => {},
      applySavedView: () => {},
    };
  }
  return ctx;
}
