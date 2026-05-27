"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { uploadHospitalRoster } from "@/lib/hospital";

import { HospitalSection, HospitalSectionHeader } from "./ui";

type RosterUploaderProps = {
  onUploaded: (sessionId: string) => void;
};

export default function RosterUploader({ onUploaded }: RosterUploaderProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(file: File | null) {
    if (!file) {
      return;
    }
    setIsUploading(true);
    setStatus(null);
    try {
      const response = await uploadHospitalRoster(file);
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
    <HospitalSection>
      <HospitalSectionHeader
        label="Your data"
        title="Pilot roster upload"
        description="PHI-free CSV only. Session data expires in 24 hours."
      />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label>
          <span className="sr-only">Upload roster CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={isUploading}
            className="block text-sm text-[var(--color-gray-400)] file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-neutral-100"
            onChange={(event) => void handleChange(event.target.files?.[0] ?? null)}
          />
        </label>
        <Button href="/demos/hospital/roster_template.csv" variant="secondary" size="sm">
          Download template
        </Button>
      </div>
      {status ? (
        <p className="mt-4 text-sm leading-6 text-[var(--color-gray-300)]">{status}</p>
      ) : (
        <p className="mt-4 text-xs leading-5 text-[var(--color-gray-500)]">
          Required: nurse_id, certifications, ward, week_hours, last_shift_end, seniority_date.
        </p>
      )}
    </HospitalSection>
  );
}
