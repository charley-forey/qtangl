"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { executeAgenticAction } from "@/lib/qros-api";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type Props = {
  remediationId?: string | null;
  scanId?: string | null;
};

export default function AgenticActionPanel({ remediationId, scanId }: Props) {
  const [preview, setPreview] = useState<{ steps: string[]; guardrails: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const previewAction = async (action: string) => {
    setLoading(true);
    try {
      const result = await executeAgenticAction({
        action,
        payload: { remediationId, scanId },
        dryRun: true,
      });
      setPreview({ steps: result.steps, guardrails: result.guardrails });
    } finally {
      setLoading(false);
    }
  };

  const approve = async (action: string) => {
    setLoading(true);
    try {
      await executeAgenticAction({
        action,
        payload: { remediationId, scanId },
        dryRun: false,
        approved: true,
      });
      trackDashboardEvent({ event: "cc_qros_agentic_approved", properties: { action } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Agentic remediation</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Automates the migration workflow — human approval required. Does not fix crypto or attest compliance.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={loading} onClick={() => void previewAction("draft_pr")}>
          Preview PR draft
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={() => void previewAction("schedule_scan")}>
          Preview scan schedule
        </Button>
      </div>
      {preview ? (
        <div className="mt-4 text-xs text-[var(--color-gray-300)]">
          <p className="font-medium text-white">Steps</p>
          <ol className="mt-1 list-decimal pl-4">
            {preview.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <Button type="button" className="mt-3" disabled={loading} onClick={() => void approve("draft_pr")}>
            Approve & execute (audit logged)
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
