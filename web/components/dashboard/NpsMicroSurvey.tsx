"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import { putDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

const DAY_MS = 24 * 60 * 60 * 1000;
const SURVEY_DELAY_DAYS = 30;

type Props = {
  firstScanAt?: string | null;
  tenantSettings?: Record<string, unknown> | null;
  onDismissed?: () => void;
};

export default function NpsMicroSurvey({ firstScanAt, tenantSettings, onDismissed }: Props) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const feedback = (tenantSettings?.feedback as {
    npsScore?: number;
    npsSubmittedAt?: string;
    npsDismissedAt?: string;
  } | undefined) ?? {};

  useEffect(() => {
    if (!firstScanAt || feedback.npsSubmittedAt || feedback.npsDismissedAt) return;
    const first = Date.parse(firstScanAt);
    if (Number.isNaN(first)) return;
    const dueAt = first + SURVEY_DELAY_DAYS * DAY_MS;
    if (Date.now() >= dueAt) {
      setOpen(true);
    }
  }, [firstScanAt, feedback.npsSubmittedAt, feedback.npsDismissedAt]);

  if (!open || feedback.npsSubmittedAt || feedback.npsDismissedAt) {
    return null;
  }

  async function submit(selected: number) {
    setScore(selected);
    setSubmitting(true);
    trackDashboardEvent("nps_submitted", { score: selected });
    try {
      await putDashboardJson("/tenant/settings", {
        settings: {
          ...tenantSettings,
          feedback: {
            ...feedback,
            npsScore: selected,
            npsSubmittedAt: new Date().toISOString(),
          },
        },
      });
      onDismissed?.();
      setTimeout(() => setOpen(false), 1200);
    } catch {
      setScore(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function dismiss() {
    trackDashboardEvent("nps_dismissed", {});
    try {
      await putDashboardJson("/tenant/settings", {
        settings: {
          ...tenantSettings,
          feedback: {
            ...feedback,
            npsDismissedAt: new Date().toISOString(),
          },
        },
      });
    } catch {
      /* optional */
    }
    setOpen(false);
    onDismissed?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <Card tone="panel" className="w-full max-w-md">
        <p className="text-sm font-medium text-white">Quick feedback</p>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          How likely are you to recommend Qtangl to a peer security leader? (0 = not at all, 10 = extremely)
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 11 }, (_, i) => i).map((value) => (
            <button
              key={value}
              type="button"
              disabled={submitting}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full border text-xs",
                score === value
                  ? "border-white bg-white text-black"
                  : "border-[var(--border-subtle)] text-white hover:bg-white/10",
              ].join(" ")}
              onClick={() => void submit(value)}
            >
              {value}
            </button>
          ))}
        </div>
        {score != null ? (
          <p className="mt-3 text-center text-xs text-emerald-300">Thanks for your feedback.</p>
        ) : (
          <button type="button" className="mt-4 w-full text-xs text-[var(--color-gray-500)] underline" onClick={() => void dismiss()}>
            Not now
          </button>
        )}
      </Card>
    </div>
  );
}
