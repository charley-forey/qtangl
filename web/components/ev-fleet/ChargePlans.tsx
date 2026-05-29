import type { ChargePlan, Scoreboard } from "@/lib/ev-fleet";

import PlanCard from "./PlanCard";
import { EvFleetEmptyState, EvFleetSection, EvFleetSectionHeader } from "./ui";

export default function ChargePlans({
  classicalPlan,
  hybridPlans,
  scoreboard,
  onOpenAudit,
}: {
  classicalPlan: ChargePlan | null;
  hybridPlans: ChargePlan[];
  scoreboard: Scoreboard | null;
  onOpenAudit: (planId: string) => void;
}) {
  if (!classicalPlan) {
    return (
      <EvFleetSection>
        <EvFleetSectionHeader label="Plans" title="Charge schedules" />
        <div className="mt-6">
          <EvFleetEmptyState title="No plans yet" description='Run "Plan routes + charge" to compare schedules.' />
        </div>
      </EvFleetSection>
    );
  }

  const recommended =
    scoreboard?.hybrid.hybrid_beats_classical_cost && hybridPlans[0] ? hybridPlans[0].id : classicalPlan.id;

  return (
    <EvFleetSection>
      <EvFleetSectionHeader
        label="Plans"
        title="Classical vs hybrid charge schedules"
        description="Side-by-side TOU-aware plans with peak kW and $/day."
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <PlanCard plan={classicalPlan} title="Classical" onOpenAudit={onOpenAudit} />
        {hybridPlans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            title={`Hybrid ${index + 1}`}
            recommended={plan.id === recommended}
            onOpenAudit={onOpenAudit}
          />
        ))}
      </div>
    </EvFleetSection>
  );
}
