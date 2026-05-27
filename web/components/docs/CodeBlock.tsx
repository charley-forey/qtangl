"use client";

import { useId, useMemo, useState } from "react";

type CodeBlockProps = {
  title?: string;
  code: object | string;
};

export default function CodeBlock({ title, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const titleId = useId();
  const renderedCode = useMemo(
    () => (typeof code === "string" ? code : JSON.stringify(code, null, 2)),
    [code]
  );
  const label = title ?? "Example";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(renderedCode);
      setCopied(true);
      setCopyMessage(`${label} copied to clipboard.`);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopyMessage(`Unable to copy ${label}.`);
    }
  }

  return (
    <div
      role="region"
      aria-labelledby={titleId}
      className="min-w-0 w-full max-w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--color-gray-950)] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.24)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
          <span id={titleId} className="text-label truncate text-[var(--color-gray-300)]">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {copyMessage}
      </p>
      <pre className="max-w-full overflow-x-auto px-4 py-4 text-xs leading-6 text-[var(--color-gray-200)] sm:px-5 sm:py-5 sm:text-sm sm:leading-7">
        <code className="block min-w-0 whitespace-pre">{renderedCode}</code>
      </pre>
    </div>
  );
}
