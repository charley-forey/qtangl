"use client";

import { useState } from "react";

import { qtanglApiBaseUrl } from "@/lib/api";

type IngestResult = {
  componentCount?: number;
  newComponents?: number;
  dedupedCount?: number;
  conflictCount?: number;
  idempotent?: boolean;
};

export default function CbomImportPanel({
  apiKey,
  onImported,
}: {
  apiKey: string;
  onImported?: () => void;
}) {
  const [sourceLabel, setSourceLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResult | null>(null);

  async function ingestFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (sourceLabel.trim()) {
        form.append("sourceLabel", sourceLabel.trim());
      }
      const response = await fetch(`${qtanglApiBaseUrl}/pqc/cbom/ingest`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Import failed.");
      }
      const payload = await response.json();
      setResult(payload);
      onImported?.();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">CBOM import</p>
      <p className="text-sm text-[var(--color-gray-300)]">
        Upload a CycloneDX 1.6/1.7 CBOM from Keyfactor, IBM CBOMkit, or another vendor. Components merge into your
        tenant aggregate with provenance labels.
      </p>
      <input
        type="text"
        value={sourceLabel}
        onChange={(event) => setSourceLabel(event.target.value)}
        placeholder="Source label (e.g. Keyfactor Q2 export)"
        className="w-full rounded-lg border border-[var(--border-strong)] bg-black px-3 py-2 text-sm text-white"
      />
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-6 text-sm text-[var(--color-gray-400)] hover:border-white hover:text-white">
        <input
          type="file"
          accept="application/json,.json"
          className="hidden"
          disabled={loading || !apiKey}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void ingestFile(file);
            }
          }}
        />
        {loading ? "Importing…" : "Drop CycloneDX JSON or click to upload"}
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {result ? (
        <p className="text-sm text-green-300">
          {result.idempotent ? "Already ingested — " : "Imported "}
          {result.componentCount} components ({result.newComponents ?? 0} new, {result.dedupedCount ?? 0} deduped
          {result.conflictCount ? `, ${result.conflictCount} conflicts` : ""})
        </p>
      ) : null}
    </div>
  );
}
