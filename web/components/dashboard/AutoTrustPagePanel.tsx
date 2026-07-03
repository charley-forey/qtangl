"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { ccFlags } from "@/lib/cc-feature-flags";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function AutoTrustPagePanel({ tenantSlug }: { tenantSlug?: string }) {
  const [copied, setCopied] = useState(false);
  if (!ccFlags.transparency) return null;

  const url = tenantSlug
    ? `https://www.qtangl.com/trust?tenant=${encodeURIComponent(tenantSlug)}`
    : "https://www.qtangl.com/trust";

  return (
    <Card tone="panel" className="p-4">
      <Eyebrow>Public trust page</Eyebrow>
      <p className="mt-1 text-xs text-[var(--color-gray-500)]">
        Shareable page with signed-report verification instructions and honest coverage caveats — not
        certification or complete estate attestation.
      </p>
      <p className="mt-3 break-all font-mono text-[11px] text-sky-300">{url}</p>
      <button
        type="button"
        className="mt-3 rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-xs text-white"
        onClick={() => {
          void navigator.clipboard.writeText(url);
          setCopied(true);
          trackDashboardEvent({ event: "cc_trust_page_shared", properties: { url } });
        }}
      >
        {copied ? "Copied" : "Copy share link"}
      </button>
    </Card>
  );
}
