"use client";

import { useCallback, useState } from "react";

import {
  docsContentToMarkdown,
  downloadTextFile,
  markdownToPlainText,
  slugifyExportFilename,
  type DocsExportMeta,
} from "@/lib/docs/page-export";

type DocsPageActionsProps = DocsExportMeta;

type ActionState = "idle" | "copied";

const actionButtonClass =
  "rounded-lg border border-[var(--border)] bg-black/30 px-3 py-1.5 text-xs text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40";

export default function DocsPageActions({
  title,
  description,
  pathname,
  lastUpdated,
}: DocsPageActionsProps) {
  const [copyState, setCopyState] = useState<ActionState>("idle");

  const getExportRoot = useCallback(() => {
    return document.querySelector<HTMLElement>("[data-docs-export-root]");
  }, []);

  const buildMarkdown = useCallback(() => {
    const root = getExportRoot();
    if (!root) return "";
    return docsContentToMarkdown(root, { title, description, pathname, lastUpdated });
  }, [description, getExportRoot, lastUpdated, pathname, title]);

  const handleCopy = useCallback(async () => {
    const markdown = buildMarkdown();
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      downloadTextFile(`${slugifyExportFilename(pathname)}.md`, markdown, "text/markdown;charset=utf-8");
    }
  }, [buildMarkdown, pathname]);

  const handleDownloadMarkdown = useCallback(() => {
    const markdown = buildMarkdown();
    if (!markdown) return;
    downloadTextFile(`${slugifyExportFilename(pathname)}.md`, markdown, "text/markdown;charset=utf-8");
  }, [buildMarkdown, pathname]);

  const handleDownloadPlainText = useCallback(() => {
    const markdown = buildMarkdown();
    if (!markdown) return;
    const plain = markdownToPlainText(markdown);
    downloadTextFile(`${slugifyExportFilename(pathname)}.txt`, plain, "text/plain;charset=utf-8");
  }, [buildMarkdown, pathname]);

  return (
    <div
      className="docs-page-actions mt-6 flex flex-wrap items-center gap-2 print:hidden"
      aria-label="Page export actions"
    >
      <button type="button" className={actionButtonClass} onClick={handleCopy}>
        {copyState === "copied" ? "Copied" : "Copy page"}
      </button>
      <button type="button" className={actionButtonClass} onClick={handleDownloadMarkdown}>
        Download .md
      </button>
      <button type="button" className={actionButtonClass} onClick={handleDownloadPlainText}>
        Download .txt
      </button>
    </div>
  );
}
