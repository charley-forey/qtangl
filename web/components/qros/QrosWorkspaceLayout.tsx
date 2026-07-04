"use client";

import { useState, type ReactNode } from "react";

import Button from "@/components/ui/Button";

type Props = {
  summaryTitle?: string;
  summary: ReactNode;
  details?: ReactNode;
  advanced?: ReactNode;
};

export default function QrosWorkspaceLayout({ summaryTitle = "Executive summary", summary, details, advanced }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <section aria-label={summaryTitle}>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-gray-500)]">
          {summaryTitle}
        </h2>
        {summary}
      </section>

      {details ? (
        <section>
          <Button type="button" variant="ghost" onClick={() => setShowDetails((v) => !v)}>
            {showDetails ? "Hide details" : "Show details"}
          </Button>
          {showDetails ? <div className="mt-4 space-y-4">{details}</div> : null}
        </section>
      ) : null}

      {advanced ? (
        <section>
          <Button type="button" variant="ghost" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? "Hide advanced" : "Advanced"}
          </Button>
          {showAdvanced ? <div className="mt-4 space-y-4">{advanced}</div> : null}
        </section>
      ) : null}
    </div>
  );
}
