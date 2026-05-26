import Card from "@/components/ui/Card";
import type { PlanVisualization as PlanVisualizationModel } from "@/lib/demo-data";
import { planVisualizationCopy } from "@/lib/copy/visualization";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";

import PlanMetrics from "./PlanMetrics";
import RoutePlanList from "./RoutePlanList";
import ScheduleTimeline from "./ScheduleTimeline";
import StaffingGrid from "./StaffingGrid";

type PlanVisualizationProps = {
  plan: PlanVisualizationModel;
  method?: string;
};

export default function PlanVisualization({ plan, method = "classical" }: PlanVisualizationProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr] xl:items-stretch">
        <Card tone="strong" size="lg" className="h-full rounded-[var(--radius-xl)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-label">{planVisualizationCopy.eyebrow}</p>
            <MethodBadge method={method} />
          </div>
          <h2 className="heading-section mt-4">{plan.summary}</h2>
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
