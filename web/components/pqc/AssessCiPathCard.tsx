"use client";

import { useState } from "react";

import Link from "next/link";

export default function AssessCiPathCard({ scanId }: { scanId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-black/20 p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="touch-target flex w-full items-center justify-between text-left text-sm font-medium text-white"
      >
        Run in CI/CD
        <span className="text-xs text-[var(--color-gray-500)]">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div className="mt-4 space-y-3 text-xs text-[var(--color-gray-400)]">
          <p>
            Gate releases on fixture scans and independent verify — no browser required.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-black p-3 font-mono text-[11px] text-[var(--color-gray-300)]">
{`# Fixture scan (sandbox key)
curl -X POST "$QTANGL_API/pqc/scan" \\
  -H "Authorization: Bearer $QTANGL_SANDBOX_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"scenarioId":"bank-tls-inventory","useFixture":true}'

# Offline verify
pip install qtangl-verify
qtangl-verify report.json --api-base $QTANGL_API --json`}
          </pre>
          <p>
            Golden scan verify:{" "}
            <Link href={`/verify?scanId=${encodeURIComponent(scanId)}`} className="text-white underline">
              /verify?scanId={scanId}
            </Link>
          </p>
          <Link href="/docs/guides/assess" className="inline-block text-white underline underline-offset-4">
            Assess API guide →
          </Link>
          {" · "}
          <Link href="/docs/integrations/ci-cd" className="inline-block text-white underline underline-offset-4">
            CI/CD integration →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
