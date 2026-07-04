"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { exportBoardDeck } from "@/lib/qros-api";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function BoardNarrativeExport() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const deck = await exportBoardDeck();
      trackDashboardEvent({ event: "cc_qros_board_export", properties: { format: "json" } });
      setPreview(deck.slides.map((s) => `${s.title}: ${s.body}`).join("\n\n"));
    } catch {
      setPreview("Unable to generate board narrative.");
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
      <Button type="button" variant="secondary" className="mt-3" disabled={loading} onClick={() => void generate()}>
        {loading ? "Generating…" : "Generate narrative"}
      </Button>
      {preview ? (
        <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/40 p-3 text-xs text-[var(--color-gray-300)]">
          {preview}
        </pre>
      ) : null}
    </Card>
  );
}
