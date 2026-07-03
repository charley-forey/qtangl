"use client";

import { useState } from "react";

import { ccFlags } from "@/lib/cc-feature-flags";
import { fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";
import { trackDashboardEvent as trackCcEvent } from "@/lib/dashboard-telemetry";

const SUGGESTED_PROMPTS = [
  "Why did readiness drop?",
  "What should I tell the board?",
  "What's our biggest quantum risk?",
] as const;

type AiCitation = { kind: string; ref: string; label: string };

type NlQueryResult = {
  text: string | null;
  source: string | null;
  citations: AiCitation[];
  confidence: string | null;
  guardrailPassed: boolean;
};

export default function ReadinessCopilotDrawer({
  persona = "executive",
}: {
  persona?: "executive" | "operator";
}) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<NlQueryResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setLoading(true);
    setPrompt(trimmed);
    trackDashboardEvent("copilot_prompt", { prompt: trimmed.slice(0, 80) });
    try {
      if (ccFlags.nlQuery) {
        const query = await postDashboardJson<{
          answer?: string;
          intent?: string;
          citations?: AiCitation[];
          confidence?: string;
          guardrailPassed?: boolean;
        }>("/tenant/ai/query", { query: trimmed, persona });
        setResult({
          text: query.answer ?? null,
          source: "ai-query",
          citations: query.citations ?? [],
          confidence: query.confidence ?? null,
          guardrailPassed: query.guardrailPassed ?? true,
        });
        trackCcEvent({
          event: "cc_nl_query_submitted",
          properties: {
            intent: query.intent ?? "unknown",
            confidence: query.confidence ?? "medium",
            guardrailPassed: query.guardrailPassed ?? true,
          },
        });
      } else {
        const explain = await fetchDashboardJson<{ explanation?: string; source?: string }>(
          "/tenant/ai/explain-portfolio",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ persona, prompt: trimmed }),
          }
        );
        setResult({
          text: explain.explanation ?? null,
          source: explain.source ?? null,
          citations: [],
          confidence: null,
          guardrailPassed: true,
        });
      }
      setOpen(true);
    } catch {
      setResult({
        text: "Unable to load copilot response. Try again or review alerts and recommendations.",
        source: null,
        citations: [],
        confidence: null,
        guardrailPassed: true,
      });
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
          {result?.text ? (
            <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-black/60 p-3 text-xs text-[var(--color-gray-300)]">
              <div className="mb-1 flex items-center justify-between">
                {result.source ? (
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-gray-500)]">
                    {result.source === "openai" || result.source === "ai-query" ? "AI-assisted" : "Rules-based"}
                  </span>
                ) : <span />}
                {result.confidence ? (
                  <span className="text-[10px] uppercase tracking-wider text-sky-300">{result.confidence} confidence</span>
                ) : null}
              </div>
              <p>{result.text}</p>
              {!result.guardrailPassed ? (
                <p className="mt-2 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] text-amber-200">
                  Guardrail flag: answer withheld or narrowed — verify against underlying scan data.
                </p>
              ) : null}
              {result.citations.length > 0 ? (
                <p className="mt-2 flex flex-wrap gap-1">
                  {result.citations.map((c) => (
                    <span key={`${c.kind}-${c.ref}`} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--color-gray-400)]">
                      {c.label}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
