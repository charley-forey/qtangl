"use client";

import { useState } from "react";

import { postDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

export default function EvidenceToolbar({
  scanId,
  reportUrlForScan,
}: {
  scanId: string | null;
  reportUrlForScan: (scanId: string, format: "pdf" | "board" | "auditor" | "bundle") => string;
}) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  if (!scanId) {
    return null;
  }

  const formats: Array<{ format: "pdf" | "board" | "auditor" | "bundle"; label: string }> = [
    { format: "bundle", label: "Evidence bundle" },
    { format: "board", label: "Board PDF" },
    { format: "pdf", label: "Full PDF" },
    { format: "auditor", label: "Auditor annex" },
  ];

  async function copyVerifyLink() {
    const url = `${window.location.origin}/verify?scanId=${encodeURIComponent(scanId ?? "")}`;
    await navigator.clipboard.writeText(url);
    trackDashboardEvent("dashboard_export", { format: "verify_link" });
    setMessage("Verify link copied.");
  }

  async function sendBoardEmail() {
    if (!email) return;
    try {
      await postDashboardJson(`/tenant/scans/${scanId}/email`, { email, format: "board" });
      setMessage(`Board pack queued for ${email}.`);
      setEmailOpen(false);
      trackDashboardEvent("dashboard_export", { format: "board_email" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Email failed.");
    }
  }

  return (
    <div
      id="evidence-toolbar"
      className="sticky bottom-4 z-20 rounded-2xl border border-[var(--border-strong)] bg-black/90 px-4 py-3 shadow-lg backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
          Evidence exports
        </span>
        <span className="font-mono text-xs text-[var(--color-gray-500)]">{scanId}</span>
        {formats.map(({ format, label }) => (
          <a
            key={format}
            href={reportUrlForScan(scanId, format)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-white hover:bg-white/10"
            onClick={() => trackDashboardEvent("dashboard_export", { format })}
          >
            {label}
          </a>
        ))}
        <button
          type="button"
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--color-gray-300)]"
          onClick={() => void copyVerifyLink()}
        >
          Copy verify link
        </button>
        <button
          type="button"
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--color-gray-300)]"
          onClick={() => setEmailOpen((v) => !v)}
        >
          Email board pack
        </button>
      </div>
      {emailOpen ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="board@company.com"
            className="rounded-full border border-[var(--border-strong)] bg-black px-3 py-1 text-xs text-white"
          />
          <button type="button" className="text-xs text-white underline" onClick={() => void sendBoardEmail()}>
            Send
          </button>
        </div>
      ) : null}
      {message ? <p className="mt-2 text-xs text-[var(--color-gray-400)]">{message}</p> : null}
    </div>
  );
}
