"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { uploadAirlineCrew } from "@/lib/airline";

import { AirlineSection, AirlineSectionHeader } from "./ui";

export default function CrewUploader({ onUploaded }: { onUploaded: (sessionId: string) => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(file: File | null) {
    if (!file) {
      return;
    }
    setIsUploading(true);
    setStatus(null);
    try {
      const response = await uploadAirlineCrew(file);
      setStatus(response.summary);
      onUploaded(response.sessionId);
      trackEvent("csv_uploaded", { fileName: file.name });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <AirlineSection>
      <AirlineSectionHeader
        label="Your data"
        title="Pilot crew roster upload"
        description="PII-free CSV only. Session data expires in 24 hours."
      />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label>
          <span className="sr-only">Upload crew CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={isUploading}
            className="block text-sm text-[var(--color-gray-400)] file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-neutral-100"
            onChange={(event) => void handleChange(event.target.files?.[0] ?? null)}
          />
        </label>
        <Button href="/demos/airline/crew_template.csv" variant="secondary" size="sm">
          Download template
        </Button>
      </div>
      {status ? (
        <p className="mt-4 text-sm leading-6 text-[var(--color-gray-300)]">{status}</p>
      ) : (
        <p className="mt-4 text-xs leading-5 text-[var(--color-gray-500)]">
          Required: crew_id, qualifications, base, block_hours_week, last_duty_end, seniority_date.
        </p>
      )}
    </AirlineSection>
  );
}
