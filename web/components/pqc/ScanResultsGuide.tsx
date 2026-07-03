"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import type { PqcScanResponse } from "@/lib/pqc";

type ScanResultsGuideProps = {
  scan: PqcScanResponse;
};

export default function ScanResultsGuide({ scan }: ScanResultsGuideProps) {
  const score = scan.scoreboard.qtangl.readiness_score;
  const qVuln = scan.scoreboard.qtangl.quantum_vulnerable;
  const band = scan.readinessBand ?? scan.scoreboard.qtangl.readiness_band;
  const hndl = scan.mosca.inequality_holds ? "elevated" : "within tolerance";

  return (
    <Card tone="feature" className="rounded-[var(--radius-feature)] border border-[var(--border-strong)]">
      <Eyebrow>What this means</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        Readiness score <strong className="text-white">{score}</strong>
        {band ? ` (${band})` : ""} reflects {qVuln} quantum-vulnerable asset
        {qVuln === 1 ? "" : "s"} in this scan. Mosca HNDL exposure is{" "}
        <strong className="text-white">{hndl}</strong> — {scan.mosca.summary}{" "}
        {scan.mosca.inequality_holds ? (
          <>
            <Link
              href="/q-day/hndl#this-quarter"
              className="text-white underline underline-offset-4"
            >
              See HNDL action plan →
            </Link>{" "}
          </>
        ) : null}
        This is an inventory aid, not
        a formal attestation; export signed evidence and share the verify link with auditors.
      </p>

      <Eyebrow className="mt-8">Recommended next steps</Eyebrow>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        <li className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-4">
          <p className="text-label">Assess → Monitor</p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
            Schedule weekly re-scans to catch crypto drift before your next audit cycle.
          </p>
          <Link href="/monitor" className="mt-3 inline-block text-xs text-white underline underline-offset-4">
            Monitor overview →
          </Link>
        </li>
        <li className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-4">
          <p className="text-label">Assess → Convert</p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
            Prioritize remediation from the backlog, then re-scan to prove the fix.
          </p>
          <Link href="/convert" className="mt-3 inline-block text-xs text-white underline underline-offset-4">
            Convert playbooks →
          </Link>
        </li>
        <li className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-4">
          <p className="text-label">Share evidence</p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
            Export CBOM + PDF and verify signatures independently at /verify.
          </p>
          <Link
            href={`/verify?scanId=${encodeURIComponent(scan.scanId)}`}
            className="mt-3 inline-block text-xs text-white underline underline-offset-4"
          >
            Verify this scan →
          </Link>
        </li>
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/command-center" variant="secondary" size="sm">
          Open dashboard
        </Button>
        <Button
          href="/access?source=assess-results&interest=Q-Day%20Monitor%20(annual)"
          size="sm"
          onClick={() =>
            trackEvent("monitor_proposed", { placement: "scan-results-guide", scanId: scan.scanId })
          }
        >
          Request Monitor pilot
        </Button>
      </div>
    </Card>
  );
}
