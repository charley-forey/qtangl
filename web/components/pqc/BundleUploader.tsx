"use client";

import { useRef } from "react";

import Button from "@/components/ui/Button";
import { uploadPqcBundle } from "@/lib/pqc";

export default function BundleUploader({
  onUploaded,
}: {
  onUploaded: (sessionId: string, summary: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pem,.crt,.txt"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const response = await uploadPqcBundle(file);
          onUploaded(response.sessionId, response.summary);
          event.target.value = "";
        }}
      />
      <Button variant="secondary" type="button" onClick={() => inputRef.current?.click()}>
        Upload cert bundle / endpoint CSV
      </Button>
    </>
  );
}
