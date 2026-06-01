"use client";

import { useState } from "react";

import { postTenantJson } from "@/lib/tenant-api";

export default function RemediationCopilotDrawer({
  apiKey,
  finding,
}: {
  apiKey: string;
  finding: { id: string; title: string; severity?: string };
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function explain() {
    setLoading(true);
    try {
      const result = await postTenantJson<{ explanation: string; source: string }>(
        "/tenant/ai/explain",
        apiKey,
        { finding: { title: finding.title, severity: finding.severity, id: finding.id } }
      );
      setText(result.explanation);
      setSource(result.source);
      setOpen(true);
    } catch {
      setText("Unable to load explanation.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="text-xs text-white underline"
        onClick={explain}
        disabled={loading}
      >
        {loading ? "…" : "Explain"}
      </button>
      {open && text ? (
        <div className="mt-2 rounded-lg border border-[var(--border-subtle)] bg-black/60 p-3 text-xs text-[var(--color-gray-300)]">
          {source ? (
            <span className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--color-gray-500)]">
              {source === "openai" ? "AI-assisted" : "Rules-based"}
            </span>
          ) : null}
          {text}
        </div>
      ) : null}
    </div>
  );
}
