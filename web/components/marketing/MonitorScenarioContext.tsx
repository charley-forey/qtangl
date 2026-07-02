"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";
import {
  getMonitorScenario,
  type MonitorScenarioBundle,
  type MonitorScenarioId,
} from "@/lib/copy/monitor-scenarios";

type MonitorScenarioContextValue = {
  scenarioId: MonitorScenarioId;
  scenario: MonitorScenarioBundle;
  weekIndex: number;
  setScenarioId: (id: MonitorScenarioId) => void;
  setWeekIndex: (index: number) => void;
};

const MonitorScenarioContext = createContext<MonitorScenarioContextValue | null>(null);

export function MonitorScenarioProvider({
  children,
  defaultScenario = "bank",
  defaultWeekIndex = 7,
}: {
  children: ReactNode;
  defaultScenario?: MonitorScenarioId;
  defaultWeekIndex?: number;
}) {
  const [scenarioId, setScenarioIdState] = useState<MonitorScenarioId>(defaultScenario);
  const [weekIndex, setWeekIndex] = useState(defaultWeekIndex);

  function setScenarioId(id: MonitorScenarioId) {
    setScenarioIdState(id);
    setWeekIndex(7);
    trackEvent("monitor_scenario_changed", { scenario: id });
  }

  const scenario = getMonitorScenario(scenarioId);

  return (
    <MonitorScenarioContext.Provider
      value={{ scenarioId, scenario, weekIndex, setScenarioId, setWeekIndex }}
    >
      {children}
    </MonitorScenarioContext.Provider>
  );
}

export function useMonitorScenario() {
  const ctx = useContext(MonitorScenarioContext);
  if (!ctx) {
    throw new Error("useMonitorScenario must be used within MonitorScenarioProvider");
  }
  return ctx;
}

export function useMonitorScenarioOptional() {
  return useContext(MonitorScenarioContext);
}
