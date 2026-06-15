"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";

type TrendPoint = {
  scanId: string;
  createdAt: string;
  readinessScore: number;
  readinessBand?: string;
};

export default function DashboardTrendSection({ points }: { points: TrendPoint[] }) {
  const count = points.length;

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Readiness trend</Eyebrow>
      {count === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No baseline yet"
            description="Run your first authorized scan to establish a readiness score. Trends appear after your second completed scan."
            action={
              <Button href="#run-baseline" size="sm">
                Run baseline scan
              </Button>
            }
          />
        </div>
      ) : count === 1 ? (
        <div className="mt-4">
          <EmptyState
            title="One scan recorded"
            description={`Latest score: ${points[0].readinessScore}${points[0].readinessBand ? ` (${points[0].readinessBand})` : ""}. Run a follow-up scan or enable weekly monitoring to see trend.`}
            action={
              <Button href="#dashboard-monitor" variant="secondary" size="sm">
                Set up monitoring
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4">
          <ReadinessTrend points={points} />
        </div>
      )}
    </Card>
  );
}
