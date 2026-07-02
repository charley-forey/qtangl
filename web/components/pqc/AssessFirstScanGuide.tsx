"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const STORAGE_KEY = "qtangl-assess-first-scan-guide-dismissed";

type AssessFirstScanGuideProps = {
  onGoToTab: (tab: "executive" | "evidence" | "remediation") => void;
};

export default function AssessFirstScanGuide({ onGoToTab }: AssessFirstScanGuideProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <Card tone="feature" className="rounded-[var(--radius-xl)]">
      <Eyebrow>First scan? Start here</Eyebrow>
      <ol className="mt-4 space-y-2 text-sm text-[var(--color-gray-300)]">
        <li>
          <button type="button" className="underline hover:text-white" onClick={() => onGoToTab("executive")}>
            1. Executive summary
          </button>{" "}
          — readiness score, Mosca timeline, top findings
        </li>
        <li>
          <button type="button" className="underline hover:text-white" onClick={() => onGoToTab("evidence")}>
            2. Evidence exports
          </button>{" "}
          — PDF, CBOM, verify link
        </li>
        <li>
          <button type="button" className="underline hover:text-white" onClick={() => onGoToTab("remediation")}>
            3. Remediation backlog
          </button>{" "}
          — prioritized migration items
        </li>
      </ol>
      <Button variant="secondary" size="sm" className="mt-4" onClick={dismiss}>
        Got it
      </Button>
    </Card>
  );
}
