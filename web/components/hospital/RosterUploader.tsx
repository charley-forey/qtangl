"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics";
import { uploadHospitalRoster } from "@/lib/hospital";

type RosterUploaderProps = {
  onUploaded: (sessionId: string) => void;
};

export default function RosterUploader({ onUploaded }: RosterUploaderProps) {
  const [status, setStatus] = useState<string>(
    "Upload a PHI-free CSV to test the workflow with your own roster."
  );
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(file: File | null) {
    if (!file) {
      return;
    }
    setIsUploading(true);
    try {
      const response = await uploadHospitalRoster(file);
      setStatus(response.summary);
      onUploaded(response.sessionId);
      trackEvent("csv_uploaded", { fileName: file.name });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Roster upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <p className="text-label">Try with your data</p>
      <h3 className="mt-3 text-xl font-semibold text-white">Upload a PHI-free roster CSV</h3>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        Required columns: <code>nurse_id</code>, <code>certifications</code>, <code>ward</code>,{" "}
        <code>week_hours</code>, <code>last_shift_end</code>, <code>seniority_date</code>.
      </p>
      <p className="mt-3 text-xs leading-6 text-[var(--color-gray-500)]">
        Data stays in-memory for up to 24 hours. Strip names and any PHI before uploading.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center">
          <span className="sr-only">Upload roster CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => handleChange(event.target.files?.[0] ?? null)}
          />
          <span className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] px-6 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.04]">
            {isUploading ? "Uploading..." : "Upload roster CSV"}
          </span>
        </label>
        <Button href="/demos/hospital/roster_template.csv" variant="secondary">
          Download template
        </Button>
      </div>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">{status}</p>
    </Card>
  );
}
