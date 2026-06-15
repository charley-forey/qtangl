"use client";

import Eyebrow from "@/components/ui/Eyebrow";
import type { PqcScanResponse } from "@/lib/pqc";

import { shortScanId } from "./ReportFormatLinks";

type ScanProvenanceCardProps = {
  scan: PqcScanResponse;
  useFixture: boolean;
  useLiteScan: boolean;
};

export default function ScanProvenanceCard({ scan, useFixture, useLiteScan }: ScanProvenanceCardProps) {
  const scanDepth = String(scan.report?.scanDepth ?? (useLiteScan ? "lite" : "standard"));
  const coverageConfidence = String(scan.report?.coverageConfidence ?? "n/a");
  const generatedAt = String(scan.report?.generatedAt ?? "n/a");
  const targetDomain = scan.scenario?.target?.domain ?? "n/a";
  const mode = useFixture ? "Fixture replay" : "Live scan";
  const proofMode = scan.handshakeProof?.mode ?? "unknown";

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-black/20 p-4">
      <Eyebrow>Scan provenance</Eyebrow>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Scan ID</dt>
          <dd className="mt-1 font-mono text-xs text-white" title={scan.scanId}>
            {shortScanId(scan.scanId)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Target</dt>
          <dd className="mt-1 text-white">{targetDomain}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Mode</dt>
          <dd className="mt-1 text-white">
            {mode}
            {useLiteScan ? " · lite subset" : ""}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Outcome</dt>
          <dd className="mt-1 text-white">{scan.scanOutcome ?? "unknown"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Coverage confidence</dt>
          <dd className="mt-1 text-white">{coverageConfidence}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Scan depth</dt>
          <dd className="mt-1 text-white">{scanDepth}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Generated</dt>
          <dd className="mt-1 text-white">{generatedAt}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--color-gray-500)]">Handshake proof</dt>
          <dd className="mt-1 text-white">{proofMode}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-6 text-[var(--color-gray-500)]">
        {useFixture
          ? "Fixture replay uses curated sample data — no outbound network. Suitable for evaluation, not attestation."
          : "Live scan results reflect reachable endpoints at scan time. Network conditions and authorization scope affect coverage."}
        {useLiteScan
          ? " Lite mode returns a subset of findings; upgrade to full depth for complete inventory and signed exports."
          : " Export signed PDF/CBOM and share the verify link for independent signature checks."}
      </p>
    </div>
  );
}
