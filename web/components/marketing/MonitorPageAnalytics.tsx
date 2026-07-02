"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

export default function MonitorPageAnalytics() {
  useEffect(() => {
    trackEvent("monitor_page_viewed");
  }, []);
  return null;
}
