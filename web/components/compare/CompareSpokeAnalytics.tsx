"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

type CompareSpokeAnalyticsProps = {
  slug: string;
};

export default function CompareSpokeAnalytics({ slug }: CompareSpokeAnalyticsProps) {
  useEffect(() => {
    trackEvent("comparison_spoke_view", { slug });
  }, [slug]);
  return null;
}
