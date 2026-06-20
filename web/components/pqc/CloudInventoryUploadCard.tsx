"use client";

import { useCallback, useRef, useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import { uploadPqcBundle } from "@/lib/pqc";

type UploadPreview = {
  algorithms: string[];
  qVulnerable?: number;
};

type CloudInventoryUploadCardProps = {
  onUploaded: (sessionId: string, preview?: UploadPreview) => void;
  apiKey?: string;
};

export default function CloudInventoryUploadCard({ onUploaded, apiKey }: CloudInventoryUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const response = await uploadPqcBundle(file, apiKey);
        onUploaded(response.sessionId, response.preview);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded, apiKey]
  );

  async function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleFile(file);
    event.target.value = "";
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <Eyebrow>Cloud inventory upload</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Drop a PEM bundle, endpoint CSV, or cloud inventory export to enrich the scan target list.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pem,.crt,.txt,.json"
        className="hidden"
        onChange={onInputChange}
      />
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          "mt-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition",
          dragging
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-[var(--border)] bg-black/20 hover:border-[var(--border-strong)]",
        ].join(" ")}
      >
        <p className="text-sm font-medium text-white">
          {uploading ? "Uploading…" : "Drop file here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-[var(--color-gray-500)]">.csv, .pem, .crt, .txt, .json</p>
      </div>
      {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
      <p className="mt-3 text-[10px] text-[var(--color-gray-600)]">
        Uploads are deleted within 24 hours per retention policy. For AWS ACM exports, use the ACM
        certificate export template in the dashboard cloud inventory guide.
      </p>
    </div>
  );
}
