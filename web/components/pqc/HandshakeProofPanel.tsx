"use client";

import type { HandshakeProof } from "@/lib/pqc";
import { PqcChip } from "./ui";

export default function HandshakeProofPanel({ proof }: { proof: HandshakeProof }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <PqcChip tone={proof.mode === "live" ? "ok" : "neutral"}>{proof.mode}</PqcChip>
        <PqcChip>{proof.hybrid_group}</PqcChip>
        <PqcChip>{proof.kem_algorithm}</PqcChip>
      </div>
      <p className="text-sm text-[var(--color-gray-300)]">{proof.summary}</p>
      <p className="text-xs text-[var(--color-gray-500)]">
        {proof.server}:{proof.port} · {proof.tls_version}
      </p>
      <pre className="max-h-32 overflow-auto rounded-lg bg-black/30 p-3 text-[10px] text-emerald-200">
        ClientHello (excerpt): {proof.client_hello_hex.slice(0, 120)}…
      </pre>
      <p className="text-xs text-[var(--color-gray-500)]">
        Named groups: {proof.named_groups.join(", ")}
      </p>
    </div>
  );
}
