"use client";

import { useCallback, useState } from "react";

import type { UpgradeContext, UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import { ASSESS_EVENTS } from "@/lib/analytics/assess-events";
import { trackEvent } from "@/lib/analytics";

export function useUpgradeGate() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeProduct, setUpgradeProduct] = useState<UpgradeProduct>("assess");
  const [upgradeContext, setUpgradeContext] = useState<UpgradeContext | null>(null);

  const openUpgrade = useCallback((product: UpgradeProduct = "assess", context?: UpgradeContext | null) => {
    setUpgradeProduct(product);
    setUpgradeContext(context ?? null);
    setUpgradeOpen(true);
    trackEvent(ASSESS_EVENTS.upgradePromptShown, {
      code: product === "assess" ? "assess_payment_required" : product,
      source: context?.source,
    });
  }, []);

  const closeUpgrade = useCallback(() => {
    setUpgradeOpen(false);
    setUpgradeContext(null);
  }, []);

  const parsePaymentError = useCallback(
    (error: unknown): boolean => {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("assess_payment_required") || message.includes("402")) {
        openUpgrade("assess");
        return true;
      }
      if (message.includes("schedule_quota") || message.includes("team_tier")) {
        openUpgrade("monitor");
        return true;
      }
      if (message.includes("convert_feature")) {
        openUpgrade("convert");
        return true;
      }
      return false;
    },
    [openUpgrade]
  );

  return {
    upgradeOpen,
    upgradeProduct,
    upgradeContext,
    openUpgrade,
    closeUpgrade,
    parsePaymentError,
  };
}
