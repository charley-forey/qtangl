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
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          {title ?? "Example"}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-slate-100">
        <code>{renderedCode}</code>
      </pre>
    </div>
  );
}
