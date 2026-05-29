"use client";

import QDayCommandCenter from "./QDayCommandCenter";
import type { CryptoAsset, Scenario } from "@/lib/pqc";

export default function PqcDemoClient(props: {
  initialInventory: CryptoAsset[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
}) {
  return <QDayCommandCenter {...props} />;
}
