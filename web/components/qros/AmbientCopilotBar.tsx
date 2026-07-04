"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";
import { trackDashboardEvent as trackCcEvent } from "@/lib/dashboard-telemetry";

type Props = {
  persona?: "executive" | "operator";
};

export default function AmbientCopilotBar({ persona = "operator" }: Props) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    trackDashboardEvent("copilot_prompt", { prompt: trimmed.slice(0, 80) });
    try {
      const payload = await fetchDashboardJson<{
        answer: string;
        intent: string;
        confidence: string;
        guardrailPassed: boolean;
      }>("/tenant/ai/query", {
        method: "POST",
        body: JSON.stringify({ query: trimmed, persona }),
      });
      setAnswer(payload.answer);
      trackCcEvent({
        event: "cc_nl_query_submitted",
        properties: {
          intent: payload.intent,
          confidence: payload.confidence,
          guardrailPassed: payload.guardrailPassed,
        },
      });
    } catch {
      setAnswer("Unable to run query right now. Try again or open the full copilot drawer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label="Ambient copilot" className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/50 p-4">
      <label className="block text-xs font-medium text-[var(--color-gray-400)]" htmlFor="qros-copilot-query">
        Ask about posture, drift, or next steps
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="qros-copilot-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          placeholder="What changed since last scan?"
          className="flex-1 rounded-full border border-[var(--border-subtle)] bg-black px-4 py-2 text-sm text-white"
        />
        <Button type="button" variant="secondary" disabled={loading} onClick={() => void submit()}>
          {loading ? "Thinking…" : "Ask"}
        </Button>
      </div>
      {answer ? (
        <p className="mt-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--color-gray-950)] p-3 text-sm text-[var(--color-gray-200)]">
          {answer}
        </p>
      ) : null}
    </section>
  );
}
