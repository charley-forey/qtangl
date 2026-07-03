"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export type DashboardRecommendation = {
  id: string;
  priority: number;
  category: string;
  what: string;
  soWhat: string;
  nowWhat: string;
  proof?: {
    type?: string;
    scanId?: string | null;
    deepLink?: string;
  };
  source: string;
  dismissible?: boolean;
};

export default function RecommendationCard({
  recommendation,
  onAction,
  onDismiss,
}: {
  recommendation: DashboardRecommendation;
  onAction?: (deepLink: string) => void;
  onDismiss?: (id: string) => void;
}) {
  const deepLink = recommendation.proof?.deepLink ?? "/command-center";

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Eyebrow>{recommendation.category}</Eyebrow>
        {recommendation.dismissible !== false && onDismiss ? (
          <button
            type="button"
            className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)] hover:text-white"
            onClick={() => onDismiss(recommendation.id)}
          >
            Dismiss
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm font-medium text-white">{recommendation.what}</p>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">{recommendation.soWhat}</p>
      <p className="mt-3 text-xs text-[var(--color-gray-300)]">
        <span className="font-medium text-sky-300">Now: </span>
        {recommendation.nowWhat}
      </p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={() => onAction?.(deepLink)}
      >
        Take action
      </Button>
    </Card>
  );
}
