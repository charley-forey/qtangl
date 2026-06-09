"use client";

import { useState } from "react";

import { uploadOfflineFindings } from "@/lib/discovery";

type OfflineUploadPanelProps = {
  apiKey: string;
};

export default function OfflineUploadPanel({ apiKey }: OfflineUploadPanelProps) {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { findings?: unknown[]; agentId?: string };
      const findings = Array.isArray(parsed.findings) ? parsed.findings : parsed;
      if (!Array.isArray(findings)) {
        throw new Error("JSON must contain a findings array");
      }
      const res = await uploadOfflineFindings(apiKey, {
        findings,
        agentId: parsed.agentId ?? "offline-upload",
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] p-4">
      <h4 className="text-sm font-semibold">Air-gap offline upload</h4>
      <p className="text-xs text-[var(--muted)]">
        Upload a sensor export JSON bundle from an air-gapped environment. Private keys are rejected at ingest.
      </p>
      <input
        type="file"
        accept=".json,.zip"
        className="text-sm"
        disabled={loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {loading && <p className="text-xs text-[var(--muted)]">Uploading…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <pre className="overflow-x-auto rounded bg-black/30 p-2 text-xs">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
