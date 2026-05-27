"use client";

import CodeBlock from "@/components/docs/CodeBlock";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import { qtanglApiBaseUrl } from "@/lib/api";
import type { OptimizeResponse, SandboxLiveStatus } from "@/lib/optimize";
import { sandboxPageCopy, tryPlannerCopy } from "@/lib/copy/try";

type SandboxResponseProps = {
  response: OptimizeResponse;
  status: SandboxLiveStatus;
  error?: string | null;
  isLoading?: boolean;
};

function statusLabel(status: SandboxLiveStatus, error?: string | null) {
  switch (status) {
    case "live":
      return `${sandboxPageCopy.liveLabel} from ${qtanglApiBaseUrl}`;
    case "fallback":
      return sandboxPageCopy.fallbackLabel;
    default:
      return sandboxPageCopy.previewLabel;
  }
}

function formatMetricKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export default function SandboxResponse({
  response,
  status,
  error = null,
  isLoading = false,
}: SandboxResponseProps) {
  const metrics = response.metrics ? Object.entries(response.metrics) : [];
  const method = response.method === "hybrid" ? "hybrid" : "classical";

  return (
    <Card tone="strong" size="lg" className="min-w-0 rounded-[var(--radius-feature)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow>Sandbox response</Eyebrow>
        <MethodBadge method={method} />
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-400)]" aria-live="polite">
        {isLoading ? tryPlannerCopy.status.generating : statusLabel(status, error)}
      </p>

      {status === "fallback" && error ? (
        <p className="mt-2 font-mono text-xs leading-6 text-[var(--color-gray-500)]">{error}</p>
      ) : null}

      {response.summary ? (
        <p className="mt-6 text-base leading-8 text-[var(--color-gray-200)]">{response.summary}</p>
      ) : null}

      {metrics.length > 0 ? (
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-6">
          {metrics.map(([key, value]) => (
            <div key={key}>
              <dt className="text-label text-[var(--color-gray-500)]">{formatMetricKey(key)}</dt>
              <dd className="mt-2 text-lg font-semibold text-white">{String(value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-6 min-w-0">
        <CodeBlock title="Response" code={response} />
      </div>
    </Card>
  );
}
