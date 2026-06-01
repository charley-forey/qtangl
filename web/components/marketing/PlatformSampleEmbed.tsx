"use client";

import { useEffect, useState } from "react";

import InventoryHeatmap from "@/components/pqc/InventoryHeatmap";
import type { CryptoAsset } from "@/lib/pqc";

export default function PlatformSampleEmbed() {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    fetch("/samples/sample-cbom-bank-tls-inventory.json")
      .then((r) => r.json())
      .then((data) => {
        const components = data?.components ?? [];
        const mapped: CryptoAsset[] = components.slice(0, 8).map((c: Record<string, unknown>, i: number) => ({
          id: String(c["bom-ref"] ?? `sample-${i}`),
          kind: "tls",
          host: String(c.name ?? "sample"),
          port: 443,
          label: String(c.name ?? "Sample asset"),
          algorithm: "RSA-2048",
          key_size: 2048,
          validity_days: 90,
          san_domains: [],
          negotiated_cipher: null,
          negotiated_group: null,
          tls_version: "TLS1.3",
          vulnerability: {
            algorithm: "RSA",
            key_size: 2048,
            shor_logical_qubits: null,
            classical_security_bits: 112,
            status: "at-risk",
            hndl_exposed: true,
            pqc_replacement: "ML-KEM-768",
            severity: "high",
            summary: "Sample illustrative asset",
          },
          hndl_verdict: "review",
          already_too_late: false,
          mosca_priority: 0.5,
          standards_refs: [],
          pqc_ready: false,
          metadata: {},
        }));
        setAssets(mapped);
        setScore(58.2);
      })
      .catch(() => setAssets([]));
  }, []);

  if (!assets.length) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-[var(--border-strong)] bg-black/40 p-6">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Sample inventory (illustrative)</p>
      {score != null ? (
        <p className="mt-2 text-2xl font-semibold text-white">Readiness {score}</p>
      ) : null}
      <div className="mt-4">
        <InventoryHeatmap assets={assets} />
      </div>
    </div>
  );
}
