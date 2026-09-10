"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { exportBoardDeck, exportBoardDeckPdf } from "@/lib/qros-api";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function BoardNarrativeExport() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const deck = await exportBoardDeck();
      trackDashboardEvent({ event: "cc_qros_board_export", properties: { format: "json" } });
      setPreview(deck.slides.map((s) => `${s.title}: ${s.body}`).join("\n\n"));
    } catch {
      setError("Unable to generate board narrative. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await exportBoardDeckPdf();
      trackDashboardEvent({ event: "cc_qros_board_export", properties: { format: "pdf" } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qros-executive-brief.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download the PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Board / QBR narrative</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        One-click executive deck from live posture — method-honest framing included.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={loading} onClick={() => void generate()}>
          {loading ? "Generating…" : "Preview narrative"}
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={() => void downloadPdf()}>
          Download PDF
        </Button>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
      {preview ? (
        <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/40 p-3 text-xs text-[var(--color-gray-300)]">
          {preview}
        </pre>
      ) : null}
    </Card>
  );
}
