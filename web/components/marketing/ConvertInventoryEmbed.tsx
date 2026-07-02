"use client";

import { useEffect, useMemo, useState } from "react";

import { useConvertDemo } from "@/components/marketing/convert-demo-context";
import InventoryHeatmap from "@/components/pqc/InventoryHeatmap";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { convertPreviewItems } from "@/lib/copy/readiness-demos";
import type { CryptoAsset } from "@/lib/pqc";

export default function ConvertInventoryEmbed() {
  const { selected } = useConvertDemo();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [flash, setFlash] = useState(false);

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
      })
      .catch(() => setAssets([]));
  }, []);

  const remediatedAssetIds = useMemo(() => {
    const ids = new Set<string>();
    convertPreviewItems.forEach((item) => {
      if (selected.has(item.id) && item.assetId) ids.add(item.assetId);
    });
    return ids;
  }, [selected]);

  useEffect(() => {
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 500);
    return () => window.clearTimeout(timer);
  }, [remediatedAssetIds.size]);

  const displayAssets = useMemo(
    () =>
      assets.map((asset) => {
        if (!remediatedAssetIds.has(asset.id)) return asset;
        return {
          ...asset,
          pqc_ready: true,
          vulnerability: {
            ...asset.vulnerability,
            status: "safe" as const,
            severity: "low" as const,
            summary: "Remediated — verify-fix pending re-scan",
          },
        };
      }),
    [assets, remediatedAssetIds]
  );

  if (!assets.length) return null;

  const remediatedCount = displayAssets.filter((a) => a.pqc_ready).length;

  return (
    <Card
      tone="panel"
      className={[
        "rounded-[var(--radius-xl)] transition-colors duration-500",
        flash ? "border-emerald-500/30" : "",
      ].join(" ")}
    >
      <Eyebrow>Inventory heatmap — synced with simulator</Eyebrow>
      <p className="mt-3 text-sm text-[var(--color-gray-400)]">
        Toggle remediation items above — matching assets transition to remediated state. Illustrative sample
        CBOM.
      </p>
      <p className="mt-2 text-sm text-white">
        {remediatedCount} of {displayAssets.length} assets marked remediated in what-if
      </p>
      <div className="mt-4 transition-all duration-500">
        <InventoryHeatmap assets={displayAssets} />
      </div>
    </Card>
  );
}
