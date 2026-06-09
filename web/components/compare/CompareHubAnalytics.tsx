"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

export default function CompareHubAnalytics() {
  useEffect(() => {
    trackEvent("compare_hub_view", {});
  }, []);
  return null;
}
