"use client";

import { useState } from "react";

import CodeBlock from "@/components/docs/CodeBlock";
import { fetchQtanglJson, qtanglSandboxApiKey } from "@/lib/api";

type DocsTryItProps = {
  path?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  fallbackResponse: object;
  label?: string;
};

export default function DocsTryIt({
  path = "/optimize",
  method = "POST",
  body,
  fallbackResponse,
  label = "Try it live",
}: DocsTryItProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canLive =
    qtanglSandboxApiKey.length > 0 && !qtanglSandboxApiKey.startsWith("<");

  async function run() {
    setLoading(true);
    setError(null);
    try {
      if (!canLive) {
        setResult(fallbackResponse);
        return;
      }
      const data = await fetchQtanglJson<object>(path, {
        method,
        ...(method === "POST" && body ? { body: JSON.stringify(body) } : {}),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setResult(fallbackResponse);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-black/35 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-label">{label}</p>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="touch-target rounded-full border border-[var(--border-strong)] bg-white/[0.06] px-4 py-2 text-sm text-white transition hover:bg-white/[0.1] disabled:opacity-50"
        >
          {loading ? "Running…" : canLive ? "Send request" : "Show example response"}
        </button>
      </div>
      {!canLive ? (
        <p className="mt-3 text-xs leading-6 text-[var(--color-gray-500)]">
          Set NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY to call the live sandbox API from the browser.
        </p>
      ) : null}
      {error ? <p className="status-message--error mt-3">{error}</p> : null}
      {result ? (
        <div className="mt-4">
          <CodeBlock title="Response" code={result} />
        </div>
      ) : null}
    </div>
  );
}
