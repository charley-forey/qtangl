"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import {
  assessBoardReadoutPreview,
  assessVerifyPreview,
} from "@/lib/copy/readiness-assess-demos";
import {
  assessDeliverableCbomSample,
  deliverableCbomHighlights,
  deliverablePreviewSections,
  type DeliverablePreviewKey,
} from "@/lib/copy/assess-deliverable-preview";
import { sampleCbomPath } from "@/lib/copy/readiness-value";
import { trackAssessLandingCta, trackAssessVerifyLink } from "@/lib/analytics/assess-landing";

type Tab = "pdf" | "cbom" | "verify" | "board";

function highlightCbomJson(json: string, key: DeliverablePreviewKey | null): string {
  if (!key) return json;
  const needles = deliverableCbomHighlights[key];
  return json
    .split("\n")
    .map((line) => {
      const match = needles.some((needle) => line.includes(needle));
      return match ? `>>> ${line}` : line;
    })
    .join("\n");
}

export default function AssessDeliverablePreview() {
  const [tab, setTab] = useState<Tab>("pdf");
  const [selectedKey, setSelectedKey] = useState<DeliverablePreviewKey | null>("readiness");

  const cbomJson = useMemo(
    () => JSON.stringify(assessDeliverableCbomSample, null, 2),
    []
  );
  const cbomDisplay = useMemo(
    () => highlightCbomJson(cbomJson, tab === "cbom" ? selectedKey : null),
    [cbomJson, selectedKey, tab]
  );

  function selectPdfItem(key: DeliverablePreviewKey) {
    setSelectedKey(key);
    setTab("cbom");
  }

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Deliverable preview — illustrative</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
        Click a PDF outline item to highlight the matching CBOM field — every assessment exports board-ready
        PDF, CycloneDX CBOM, and a verify receipt auditors can check independently.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["pdf", "Executive PDF"],
            ["cbom", "CycloneDX CBOM"],
            ["verify", "Verify receipt"],
            ["board", "Board readout"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              "touch-target rounded-full border px-3 py-1.5 text-xs font-medium transition",
              tab === id
                ? "border-white/30 bg-white/10 text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-black/60 p-4">
        {tab === "pdf" ? (
          <div className="space-y-4 text-sm">
            {deliverablePreviewSections.map((section) => (
              <div key={section.pdfTitle}>
                <p className="font-semibold text-white">{section.pdfTitle}</p>
                <ul className="mt-2 list-none space-y-1 pl-0 text-[var(--color-gray-300)]">
                  {section.pdfItems.map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => selectPdfItem(item.key)}
                        className={[
                          "text-left underline decoration-dotted underline-offset-4 hover:text-white",
                          selectedKey === item.key ? "text-white" : "",
                        ].join(" ")}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-xs text-[var(--color-gray-500)]">
              Selected item syncs with the CBOM tab — illustrative sample only.
            </p>
          </div>
        ) : null}

        {tab === "cbom" ? (
          <div>
            <pre className="text-xs leading-6 text-emerald-200/90">
              {cbomDisplay.split("\n").map((line, index) => (
                <span
                  key={`${index}-${line.slice(0, 12)}`}
                  className={line.startsWith(">>>") ? "block bg-emerald-500/15 text-emerald-100" : "block"}
                >
                  {line.replace(/^>>> /, "")}
                </span>
              ))}
            </pre>
            <Button
              href={sampleCbomPath}
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => trackAssessLandingCta("deliverable_cbom_download", sampleCbomPath)}
            >
              Download full sample CBOM
            </Button>
          </div>
        ) : null}

        {tab === "verify" ? (
          <dl className="grid gap-3 text-sm">
            {Object.entries(assessVerifyPreview).map(([field, value]) => (
              <div key={field} className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="font-mono text-xs uppercase text-[var(--color-gray-500)]">{field}</dt>
                <dd className="text-[var(--color-gray-200)]">{String(value)}</dd>
              </div>
            ))}
            <dd className="pt-2">
              <Button
                href="/verify?token=sample-token"
                variant="secondary"
                size="sm"
                onClick={() => trackAssessVerifyLink("assess_deliverable_preview", "/verify?token=sample-token")}
              >
                See sample verify page
              </Button>
            </dd>
          </dl>
        ) : null}

        {tab === "board" ? (
          <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--color-gray-300)]">
            {assessBoardReadoutPreview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        ) : null}
      </div>
    </Card>
  );
}
