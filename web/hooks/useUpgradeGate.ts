"use client";

import { useCallback, useState } from "react";

import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import { ASSESS_EVENTS } from "@/lib/analytics/assess-events";
import { trackEvent } from "@/lib/analytics";

export function useUpgradeGate() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeProduct, setUpgradeProduct] = useState<UpgradeProduct>("assess");

  const openUpgrade = useCallback((product: UpgradeProduct = "assess") => {
    setUpgradeProduct(product);
    setUpgradeOpen(true);
    trackEvent(ASSESS_EVENTS.upgradePromptShown, {
      code: product === "assess" ? "assess_payment_required" : product,
    });
  }, []);

  const closeUpgrade = useCallback(() => setUpgradeOpen(false), []);

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
    openUpgrade,
    closeUpgrade,
    parsePaymentError,
  };
}
