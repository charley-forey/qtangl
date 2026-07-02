"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AssessPageContextValue = {
  scanComplete: boolean;
  setScanComplete: (value: boolean) => void;
};

const AssessPageContext = createContext<AssessPageContextValue>({
  scanComplete: false,
  setScanComplete: () => {},
});

export function useAssessPageContext() {
  return useContext(AssessPageContext);
}

export function AssessPageProvider({ children }: { children: ReactNode }) {
  const [scanComplete, setScanComplete] = useState(false);
  return (
    <AssessPageContext.Provider value={{ scanComplete, setScanComplete }}>
      {children}
    </AssessPageContext.Provider>
  );
}

export default function AssessPageShell({
  children,
  marketingBelow,
}: {
  children: ReactNode;
  marketingBelow: ReactNode;
}) {
  const { scanComplete } = useAssessPageContext();
  const [expanded, setExpanded] = useState(false);

  if (!scanComplete) {
    return (
      <>
        {children}
        {marketingBelow}
      </>
    );
  }

  return (
    <>
      {children}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="touch-target w-full rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-left text-sm font-medium text-white"
          aria-expanded={expanded}
        >
          {expanded ? "Hide" : "Learn more about Assess"} — how it works, frameworks, FAQ
        </button>
        {expanded ? <div className="mt-6">{marketingBelow}</div> : null}
      </div>
    </>
  );
}
