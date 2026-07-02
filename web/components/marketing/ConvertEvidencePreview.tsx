"use client";

import { useState } from "react";

import { useConvertDemo, type ConvertEvidenceTab } from "@/components/marketing/convert-demo-context";
import ScanDiffPanel from "@/components/pqc/ScanDiffPanel";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  convertPreviewDiff,
  convertPreviewJiraTicket,
  convertPreviewPdfExcerpt,
  convertPreviewVerifyCli,
  convertPreviewVerifyPayload,
} from "@/lib/copy/readiness-demos";

const TABS: Array<{ id: ConvertEvidenceTab; label: string }> = [
  { id: "diff", label: "Scan diff" },
  { id: "auditor", label: "Auditor pack" },
  { id: "verify", label: "Verify CLI" },
  { id: "pdf", label: "PDF excerpt" },
  { id: "jira", label: "Jira ticket" },
];

export default function ConvertEvidencePreview() {
  const { evidenceTab, setEvidenceTab } = useConvertDemo();
  const [copied, setCopied] = useState(false);

  async function copyVerify() {
    try {
      await navigator.clipboard.writeText(convertPreviewVerifyCli);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Evidence preview — Convert tier</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
        Before/after scan diffs, signed auditor packs, and verify links your GRC team exports after verify-fix.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Evidence preview tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={evidenceTab === tab.id}
            onClick={() => setEvidenceTab(tab.id)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              evidenceTab === tab.id
                ? "border-white/30 bg-white/10 text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-black/60 p-4">
        {evidenceTab === "diff" ? <ScanDiffPanel diff={convertPreviewDiff} /> : null}

        {evidenceTab === "auditor" ? (
          <pre className="text-xs leading-6 text-emerald-200/90">
            {JSON.stringify(convertPreviewVerifyPayload, null, 2)}
          </pre>
        ) : null}

        {evidenceTab === "verify" ? (
          <div>
            <pre className="whitespace-pre-wrap text-xs leading-6 text-emerald-200/90">{convertPreviewVerifyCli}</pre>
            <button
              type="button"
              onClick={() => void copyVerify()}
              className="mt-3 rounded-full border border-[var(--border-strong)] px-4 py-1.5 text-xs text-white hover:bg-white/5"
            >
              {copied ? "Copied" : "Copy output"}
            </button>
          </div>
        ) : null}

        {evidenceTab === "pdf" ? (
          <dl className="grid gap-3 text-sm">
            {Object.entries(convertPreviewPdfExcerpt).map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">{key}</dt>
                <dd className="mt-1 font-mono text-xs text-[var(--color-gray-300)]">
                  {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {evidenceTab === "jira" ? (
          <div className="space-y-3 font-sans text-sm text-[#d1d2d3]">
            <p>
              <span className="font-semibold text-[#e8e8e8]">{convertPreviewJiraTicket.key}</span> ·{" "}
              {convertPreviewJiraTicket.status}
            </p>
            <p className="font-medium text-white">{convertPreviewJiraTicket.summary}</p>
            <pre className="whitespace-pre-wrap text-xs leading-6 text-[var(--color-gray-400)]">
              {convertPreviewJiraTicket.description}
            </pre>
            <p className="text-xs text-[var(--color-gray-500)]">
              Labels: {convertPreviewJiraTicket.labels.join(", ")}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
