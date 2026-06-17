"use client";

import { useState } from "react";

import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

const SUGGESTED_PROMPTS = [
  "Why did readiness drop?",
  "What should I tell the board?",
  "What's our biggest quantum risk?",
] as const;

export default function ReadinessCopilotDrawer({
  persona = "executive",
}: {
  persona?: "executive" | "operator";
}) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setLoading(true);
    setPrompt(trimmed);
    trackDashboardEvent("copilot_prompt", { prompt: trimmed.slice(0, 80) });
    try {
      const result = await fetchDashboardJson<{ explanation?: string; source?: string }>(
        "/tenant/ai/explain-portfolio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persona, prompt: trimmed }),
        }
      );
      setText(result.explanation ?? null);
      setSource(result.source ?? null);
      setOpen(true);
    } catch {
      setText("Unable to load copilot response. Try again or review alerts and recommendations.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-xs text-white"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Readiness copilot
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-96 rounded-2xl border border-[var(--border-strong)] bg-black p-4 shadow-xl">
          <p className="text-xs font-medium text-white">Ask about your portfolio</p>
          <p className="mt-1 text-[10px] text-[var(--color-gray-500)]">
            Context: latest scan diff, open alerts, and top recommendations.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={loading}
                className="rounded-full border border-[var(--border-subtle)] px-2 py-1 text-[10px] text-sky-300 hover:bg-white/5 disabled:opacity-50"
                onClick={() => void ask(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(prompt);
            }}
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a readiness question…"
              className="min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black disabled:opacity-50"
            >
              {loading ? "…" : "Ask"}
            </button>
          </form>
          {text ? (
            <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-black/60 p-3 text-xs text-[var(--color-gray-300)]">
              {source ? (
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-[var(--color-gray-500)]">
                  {source === "openai" ? "AI-assisted" : "Rules-based"}
                </span>
              ) : null}
              {text}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
