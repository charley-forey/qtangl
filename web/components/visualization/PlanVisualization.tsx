import Card from "@/components/ui/Card";
import type { PlanVisualization as PlanVisualizationModel } from "@/lib/demo-data";

import PlanMetrics from "./PlanMetrics";
import RoutePlanList from "./RoutePlanList";
import ScheduleTimeline from "./ScheduleTimeline";
import StaffingGrid from "./StaffingGrid";

type PlanVisualizationProps = {
  plan: PlanVisualizationModel;
};

export default function PlanVisualization({ plan }: PlanVisualizationProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="rounded-[1.5rem] p-6">
          <p className="text-label">Why this plan works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {plan.summary}
          </h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {plan.explanation.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </Card>

        {plan.kind === "schedule" ? <ScheduleTimeline plan={plan} /> : null}
        {plan.kind === "routing" ? <RoutePlanList plan={plan} /> : null}
        {plan.kind === "allocation" ? <StaffingGrid plan={plan} /> : null}
      </div>

      <PlanMetrics metrics={plan.metrics} />
    </div>
  );
}
