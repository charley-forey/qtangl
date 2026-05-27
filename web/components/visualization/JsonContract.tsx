"use client";

import { useState } from "react";

import TechnologyBlock from "@/components/technology/TechnologyBlock";
import { apiPreviewRequest, apiPreviewResponse } from "@/lib/copy/api-examples";
import { jsonContractCopy } from "@/lib/copy/visualization";
import { jsonContractCallouts } from "@/lib/copy/technology-deep";

type JsonContractProps = {
  className?: string;
};

function formatJson(value: object) {
  return JSON.stringify(value, null, 2);
}

function JsonCodeBlock({
  json,
  callouts,
}: {
  json: string;
  callouts: readonly { line: number; label: string; detail: string }[];
}) {
  const lines = json.split("\n");

  return (
    <>
      <pre className="max-h-[24rem] overflow-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/55 p-4 font-mono text-[11px] leading-6 text-[var(--color-gray-300)] sm:text-xs">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const callout = callouts.find((item) => item.line === lineNumber);

          return (
            <div
              key={lineNumber}
              className={callout ? "bg-white/[0.04] -mx-4 px-4" : undefined}
            >
              <code>
                <span className="mr-3 inline-block w-5 select-none text-[var(--color-gray-600)] sm:mr-4 sm:w-6">
                  {lineNumber}
                </span>
                {line}
              </code>
            </div>
          );
        })}
      </pre>
      <ul className="space-y-2 border-t border-[var(--border)] pt-4">
        {callouts.map((item) => (
          <li
            key={item.label}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.03] px-3 py-2"
          >
            <p className="font-mono text-xs text-white">{item.label}</p>
            <p className="mt-1 text-xs leading-6 text-[var(--color-gray-500)]">{item.detail}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function ContractColumn({
  title,
  json,
  callouts,
}: {
  title: string;
  json: string;
  callouts: readonly { line: number; label: string; detail: string }[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <JsonCodeBlock json={json} callouts={callouts} />
    </div>
  );
}

export default function JsonContract({ className = "" }: JsonContractProps) {
  const [mobileTab, setMobileTab] = useState<"request" | "response">("request");
  const requestJson = formatJson(apiPreviewRequest);
  const responseJson = formatJson(apiPreviewResponse);

  return (
    <TechnologyBlock
      eyebrow={jsonContractCopy.eyebrow}
      title={jsonContractCopy.title}
      description={jsonContractCopy.description}
      className={className}
      contentClassName="grid-min-0"
    >
      <div className="flex gap-2 md:hidden" role="tablist" aria-label="API contract">
        {(["request", "response"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab}
            onClick={() => setMobileTab(tab)}
            className={[
              "touch-target flex-1 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors",
              mobileTab === tab
                ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
                : "border-[var(--border)] text-[var(--color-gray-500)]",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="md:hidden">
        {mobileTab === "request" ? (
          <ContractColumn
            title="Request"
            json={requestJson}
            callouts={jsonContractCallouts.request}
          />
        ) : (
          <ContractColumn
            title="Response"
            json={responseJson}
            callouts={jsonContractCallouts.response}
          />
        )}
      </div>

      <div className="hidden gap-8 md:grid xl:grid-cols-2 xl:gap-10">
        <ContractColumn
          title="Request"
          json={requestJson}
          callouts={jsonContractCallouts.request}
        />
        <ContractColumn
          title="Response"
          json={responseJson}
          callouts={jsonContractCallouts.response}
        />
      </div>
    </TechnologyBlock>
  );
}
