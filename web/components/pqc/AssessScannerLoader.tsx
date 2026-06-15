"use client";

import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import type { CryptoAsset, Scenario } from "@/lib/pqc";

const PqcDemoClient = dynamic(() => import("./PqcDemoClient"), {
  ssr: false,
  loading: () => (
    <Card tone="strong" className="rounded-[var(--radius-xl)] p-6">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
        ))}
      </div>
      <div className="mt-6 h-40 animate-pulse rounded-xl bg-white/5" />
      <p className="mt-4 text-sm text-[var(--color-gray-300)]">Loading assessment scanner…</p>
    </Card>
  ),
});

type AssessScannerLoaderProps = {
  initialInventory: CryptoAsset[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
};

export default function AssessScannerLoader(props: AssessScannerLoaderProps) {
  return <PqcDemoClient {...props} />;
}
