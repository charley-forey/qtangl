"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { uploadEvFleetStops } from "@/lib/ev-fleet";

import { EvFleetSection, EvFleetSectionHeader } from "./ui";

export default function StopsUploader({ onUploaded }: { onUploaded: (sessionId: string) => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(file: File | null) {
    if (!file) return;
    setIsUploading(true);
    try {
      const response = await uploadEvFleetStops(file);
      setStatus(response.summary);
      onUploaded(response.sessionId);
      trackEvent("ev_fleet_upload", { type: "stops", fileName: file.name });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <EvFleetSection>
      <EvFleetSectionHeader label="Data" title="Upload stops.csv" />
      <input
        type="file"
        accept=".csv"
        disabled={isUploading}
        className="mt-4 block text-sm text-[var(--color-gray-400)] file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:text-black"
        onChange={(e) => void handleChange(e.target.files?.[0] ?? null)}
      />
      {status ? <p className="mt-3 text-sm text-[var(--color-gray-400)]">{status}</p> : null}
    </EvFleetSection>
  );
}
