"use client";

import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { fetchNextActions, mutateNbaAction } from "@/lib/qros-api";
import { useQrosQuery } from "@/lib/qros-hooks";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function NextBestActionFeed() {
  const router = useRouter();
  const { data: actions, loading, error, reload } = useQrosQuery(fetchNextActions, []);

  if (loading) {
    return (
      <Card tone="panel" className="animate-pulse p-6" aria-busy="true">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="mt-4 space-y-3">
          <div className="h-12 rounded bg-white/5" />
          <div className="h-12 rounded bg-white/5" />
        </div>
      </Card>
    );
  }

  if (error) {
    return <EmptyState title="Action queue unavailable" description={error} />;
  }

  if (!actions?.length) {
    return (
      <EmptyState
        title="No urgent actions"
        description="Posture is stable. Run a scan or enable monitor schedules to keep evidence fresh."
      />
    );
  }

  return (
    <Card tone="feature" className="p-5" data-tour="nba-feed">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Next best actions</h2>
          <p className="text-xs text-[var(--color-gray-400)]">Ranked by risk-reduction per effort</p>
        </div>
      </div>
      <ol className="space-y-3" aria-label="Prioritized actions">
        {actions.slice(0, 6).map((action, index) => (
          <li
            key={action.id}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--color-gray-500)]">
                #{index + 1} · {action.kind} · {action.effort} effort
              </p>
              <p className="mt-1 text-sm font-medium text-white">{action.title}</p>
              <p className="mt-1 text-xs text-[var(--color-gray-400)]">{action.impact}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  void mutateNbaAction(action.id, "snooze").then(() => reload());
                }}
              >
                Snooze
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  void mutateNbaAction(action.id, "dismiss").then(() => reload());
                }}
              >
                Dismiss
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  trackDashboardEvent({
                    event: "cc_qros_nba_action",
                    properties: { actionId: action.id, kind: action.kind },
                  });
                  if (action.deepLink) router.push(action.deepLink);
                }}
              >
                {action.cta?.label ?? "Open"}
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
