"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { CryptoAsset, Scenario } from "@/lib/pqc";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import { QtanglApiProvider } from "@/lib/qtangl-api-context";

import QDayCommandCenter from "./QDayCommandCenter";

type AssessRunnerPanelProps = {
  initialInventory: CryptoAsset[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiKey: string;
  useBff?: boolean;
  canAdminDomains?: boolean;
  onDomainsChange?: (domains: string[]) => void;
  onMessage?: (message: string) => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
  onRefresh?: () => void;
  onScanComplete?: (scanId: string) => void;
};

export default function AssessRunnerPanel({
  initialInventory,
  initialScenarios,
  backendConnected,
  backendMessage,
  apiKey,
  useBff = false,
  canAdminDomains = false,
  onDomainsChange,
  onMessage,
  onOpenUpgrade,
  onRefresh,
}: AssessRunnerPanelProps) {
  return (
    <QtanglApiProvider initialMode="production" initialTenantKey={apiKey} useBff={useBff}>
      <Card tone="strong" className="rounded-[var(--radius-xl)] p-6">
        <Eyebrow>Production baseline</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          Run an authorized live scan or upload certificates — results save to your tenant history.
        </p>
        <div className="mt-6">
          <QDayCommandCenter
            initialInventory={initialInventory}
            initialScenarios={initialScenarios}
            backendConnected={backendConnected}
            backendMessage={backendMessage}
            apiBaseUrl=""
            compact
            basePath="/dashboard"
            syncUrlEnabled={false}
            canAdminDomains={canAdminDomains}
            useBffForDomains={useBff}
            onDomainsChange={onDomainsChange}
            onMessage={onMessage}
            onOpenUpgrade={onOpenUpgrade}
            onRefresh={onRefresh}
          />
        </div>
      </Card>
    </QtanglApiProvider>
  );
}
