"use client";

import Button from "@/components/ui/Button";
import { convertSampleArtifact } from "@/lib/copy/readiness-convert";
import { convertPreviewVerifyPayload } from "@/lib/copy/readiness-demos";

export default function ConvertSampleArtifactButton() {
  function download() {
    const blob = new Blob([JSON.stringify(convertPreviewVerifyPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = convertSampleArtifact.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--color-gray-400)]">{convertSampleArtifact.description}</p>
      <Button type="button" variant="secondary" size="sm" onClick={download}>
        {convertSampleArtifact.label}
      </Button>
    </div>
  );
}
