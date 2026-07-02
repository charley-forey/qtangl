"use client";

import Button from "@/components/ui/Button";

export default function AssessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center" role="alert">
      <h2 className="text-xl font-semibold text-white">Assessment scanner unavailable</h2>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-400)]">
        {error.message || "Something went wrong while loading the scanner."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/assess" variant="secondary">
          Reload assess page
        </Button>
      </div>
    </div>
  );
}
