"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import { postDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type AuditorPacketResponse = {
  scanIds: string[];
  bundleUrls: string[];
  verifyCli: string;
  caveats: string[];
};

export default function AuditorPacketButton({
  scanIds,
  onMessage,
}: {
  scanIds: string[];
  onMessage?: (message: string) => void;
}) {
  const [packet, setPacket] = useState<AuditorPacketResponse | null>(null);
  const [busy, setBusy] = useState(false);

  if (scanIds.length === 0) return null;

  async function build() {
    setBusy(true);
    try {
      const result = await postDashboardJson<AuditorPacketResponse>("/tenant/evidence/auditor-packet", {
        scanIds,
      });
      setPacket(result);
      trackDashboardEvent({ event: "cc_auditor_packet_created", properties: { scanCount: scanIds.length } });
      onMessage?.("Auditor packet ready.");
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Could not build auditor packet.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void build()}>
        {busy ? "Building…" : "Build auditor packet"}
      </Button>
      {packet ? (
        <div className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-black/40 p-3 text-xs">
          <p className="text-white">Signed bundles ({packet.bundleUrls.length})</p>
          <ul className="space-y-1">
            {packet.bundleUrls.map((url) => (
              <li key={url}>
                <a href={url} className="break-all text-sky-300 hover:underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Verify independently</p>
            <code className="mt-1 block break-all rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-emerald-300">
              {packet.verifyCli}
            </code>
          </div>
          {packet.caveats.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-[10px] text-[var(--color-gray-500)]">
              {packet.caveats.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
