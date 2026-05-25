"use client";

import { useMemo, useState } from "react";

type CodeBlockProps = {
  title?: string;
  code: object | string;
};

export default function CodeBlock({ title, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const renderedCode = useMemo(
    () => (typeof code === "string" ? code : JSON.stringify(code, null, 2)),
    [code]
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(renderedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--color-gray-950)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white" />
          <span className="text-label text-[var(--color-gray-300)]">
            {title ?? "Example"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-[var(--color-gray-200)]">
        <code>{renderedCode}</code>
      </pre>
    </div>
  );
}
