import type { PlanVisualization } from "@/lib/demo-data";
import RoutePlanList from "@/components/visualization/RoutePlanList";
import ScheduleTimeline from "@/components/visualization/ScheduleTimeline";
import StaffingGrid from "@/components/visualization/StaffingGrid";

type SandboxPlanPreviewProps = {
  plan: PlanVisualization;
};

export default function SandboxPlanPreview({ plan }: SandboxPlanPreviewProps) {
  return (
    <div className="mt-6 border-t border-[var(--border)] pt-6">
      <p className="text-label text-[var(--color-gray-500)]">Visual plan</p>
      <div className="mt-4">
        {plan.kind === "schedule" ? <ScheduleTimeline plan={plan} /> : null}
        {plan.kind === "routing" ? <RoutePlanList plan={plan} /> : null}
        {plan.kind === "allocation" ? <StaffingGrid plan={plan} /> : null}
      </div>
    </div>
  );
}
