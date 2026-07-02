"use client";

import { useEffect } from "react";

import { trackAssessSectionView } from "@/lib/analytics/assess-landing";

export default function AssessSectionAnalytics({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    let tracked = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (tracked) return;
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25)) {
          tracked = true;
          trackAssessSectionView(sectionId);
          observer.disconnect();
        }
      },
      { threshold: [0.25] }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sectionId]);

  return null;
}
