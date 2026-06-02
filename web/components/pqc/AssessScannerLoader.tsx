"use client";

import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import type { CryptoAsset, Scenario } from "@/lib/pqc";

const PqcDemoClient = dynamic(() => import("./PqcDemoClient"), {
  ssr: false,
  loading: () => (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <p className="text-sm text-[var(--color-gray-300)]">Loading assessment scanner…</p>
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
