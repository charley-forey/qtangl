"use client";

import { useRouter } from "next/navigation";

import Eyebrow from "@/components/ui/Eyebrow";
import RecommendationCard, {
  type DashboardRecommendation,
} from "@/components/dashboard/RecommendationCard";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { navigateDashboardDeepLink } from "@/lib/dashboard-deep-links";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

export default function DashboardActionQueue({
  recommendations,
  onAction,
  onDismissed,
}: {
  recommendations: DashboardRecommendation[];
  onAction?: (action: string) => void;
  onDismissed?: () => void;
}) {
  const router = useRouter();

  if (!recommendations.length) {
    return null;
  }

  async function dismiss(id: string) {
    try {
      await fetchDashboardJson(`/tenant/recommendations/${encodeURIComponent(id)}/dismiss`, {
        method: "POST",
      });
      onDismissed?.();
    } catch {
      /* optional */
    }
  }

  function handleDeepLink(link: string) {
    trackDashboardEvent("recommendation_clicked", { deepLink: link });
    navigateDashboardDeepLink(link, router, (tab) => onAction?.(tab));
  }

  return (
    <div className="space-y-3" data-tour="action-queue">
      <Eyebrow>Recommended next steps</Eyebrow>
      {recommendations.slice(0, 5).map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onAction={handleDeepLink}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
}
