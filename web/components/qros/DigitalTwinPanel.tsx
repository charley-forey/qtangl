"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { fetchDigitalTwin } from "@/lib/qros-api";

type Props = {
  scanId: string | null;
};

export default function DigitalTwinPanel({ scanId }: Props) {
  const [blastRadius, setBlastRadius] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    fetchDigitalTwin(scanId)
      .then((payload) => {
        setBlastRadius(payload.blastRadius ?? []);
        setNote(payload.simulationNote ?? "");
      })
      .finally(() => setLoading(false));
  }, [scanId]);

  if (!scanId) {
    return (
      <EmptyState title="Digital twin unavailable" description="Complete a scan to load the dependency model." />
    );
  }

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Crypto digital twin</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Interactive blast-radius model for migration sequencing (node-capped for large estates).
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-[var(--color-gray-400)]">Loading graph…</p>
      ) : (
        <>
          <p className="mt-3 text-xs text-[var(--color-gray-500)]">{note}</p>
          <p className="mt-2 text-sm text-white">Blast radius nodes: {blastRadius.length || "Select a component in the graph"}</p>
        </>
      )}
    </Card>
  );
}
