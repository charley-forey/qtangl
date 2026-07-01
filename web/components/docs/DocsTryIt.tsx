"use client";

import { useEffect, useState } from "react";

import CodeBlock from "@/components/docs/CodeBlock";
import { fetchQtanglJson, qtanglSandboxApiKey } from "@/lib/api";
import {
  DOCS_API_KEY_STORAGE,
  readStoredDocsApiKey,
  writeStoredDocsApiKey,
} from "@/lib/docs/try-it";

type DocsTryItProps = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  fallbackResponse: object;
  label?: string;
  auth?: boolean;
};

function isUsableApiKey(key: string): boolean {
  return key.length > 0 && !key.startsWith("<");
}

export default function DocsTryIt({
  path,
  method = "POST",
  body,
  fallbackResponse,
  label = "Try it live",
  auth = true,
}: DocsTryItProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");

  useEffect(() => {
    setApiKeyInput(readStoredDocsApiKey());
  }, []);

  const userKey = apiKeyInput.trim();
  const sandboxKey = qtanglSandboxApiKey.trim();
  const activeKey = userKey || sandboxKey;
  const canLive = auth ? isUsableApiKey(activeKey) : true;

  function persistApiKey(value: string) {
    setApiKeyInput(value);
    writeStoredDocsApiKey(value);
  }

  async function run() {
    setLoading(true);
    setError(null);
    try {
      if (!canLive) {
        setResult(fallbackResponse);
        return;
      }
      const hasBody = body && method !== "GET" && method !== "DELETE";
      const data = await fetchQtanglJson<object>(path, {
        method,
        ...(hasBody ? { body: JSON.stringify(body) } : {}),
        ...(auth && userKey ? { apiKey: userKey } : {}),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setResult(fallbackResponse);
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = loading
    ? "Running…"
    : canLive
      ? "Send request"
      : "Show example response";

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
          {buttonLabel}
        </button>
      </div>

      {auth ? (
        <div className="mt-4 space-y-2">
          <label htmlFor={`${DOCS_API_KEY_STORAGE}-input`} className="text-xs text-[var(--color-gray-500)]">
            API key (optional — stored in this tab&apos;s session only)
          </label>
          <input
            id={`${DOCS_API_KEY_STORAGE}-input`}
            type="password"
            autoComplete="off"
            value={apiKeyInput}
            onChange={(event) => persistApiKey(event.target.value)}
            placeholder="Bearer key from Settings → Automation API keys"
            className="w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 font-mono text-sm text-white placeholder:text-[var(--color-gray-600)]"
          />
          <p className="text-xs leading-6 text-[var(--color-gray-500)]">
            Paste your tenant API key to call the live API with your credentials. Leave blank to use the
            public sandbox key when configured, or click &ldquo;Show example response&rdquo; for the static
            fixture below.
          </p>
        </div>
      ) : null}

      {!auth || canLive ? null : (
        <p className="mt-3 text-xs leading-6 text-[var(--color-gray-500)]">
          Enter an API key above, or set <code className="font-mono">NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY</code>{" "}
          for the shared sandbox.
        </p>
      )}

      {error ? <p className="status-message--error mt-3">{error}</p> : null}
      {result ? (
        <div className="mt-4">
          <CodeBlock title="Response" code={result} />
        </div>
      ) : null}
    </div>
  );
}
