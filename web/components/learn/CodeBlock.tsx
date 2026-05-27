"use client";

import { useState } from "react";

type CodeBlockProps = {
  source: string;
  language?: string;
  title?: string;
};

export default function CodeBlock({ source, language = "text", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/60">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gray-400)]">
          {title ?? language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-7 text-[var(--color-gray-200)]">
        <code>{source}</code>
      </pre>
    </div>
  );
}
