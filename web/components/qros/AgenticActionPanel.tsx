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
  const [preview, setPreview] = useState<{ action: string; payload: { remediationId?: string | null; scanId?: string | null }; steps: string[]; guardrails: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const previewAction = async (action: string) => {
    setLoading(true);
    setPreview(null);
    setError(null);
    setStatus(null);
    setOutput(null);
    try {
      const payload = { remediationId, scanId };
      const result = await executeAgenticAction({
        action,
        payload,
        dryRun: true,
      });
      if (result.status !== "preview") throw new Error(`Preview unavailable (${result.status}).`);
      setPreview({ action, payload, steps: result.steps, guardrails: result.guardrails });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to preview this action.");
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    if (!preview || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await executeAgenticAction({
        action: preview.action,
        payload: preview.payload,
        dryRun: false,
        approved: true,
      });
      if (result.status === "failed") throw new Error(result.error ? `Action failed: ${result.error}` : "Action failed. Review the selected scan or remediation and try again.");
      setStatus(`Action outcome: ${result.status}`);
      setOutput(result.result ?? null);
      trackDashboardEvent({ event: "cc_qros_agentic_approved", properties: { action: preview.action } });
      setPreview(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to execute this action.");
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
      {error ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
      {status ? <p role="status" className="mt-3 text-sm text-sky-300">{status}</p> : null}
      {output ? (
        <details className="mt-3 text-xs text-[var(--color-gray-300)]" open>
          <summary>Action result — review before applying</summary>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded border border-[var(--border-subtle)] p-3">{JSON.stringify(output, null, 2)}</pre>
        </details>
      ) : null}
      {preview ? (
        <div className="mt-4 text-xs text-[var(--color-gray-300)]">
          <p className="font-medium text-white">Steps</p>
          <ol className="mt-1 list-decimal pl-4">
            {preview.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <ul className="mt-2 list-disc pl-4" aria-label="Action guardrails">
            {preview.guardrails.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}
          </ul>
          <Button type="button" className="mt-3" disabled={loading} onClick={() => void approve()}>
            Approve & execute (audit logged)
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
