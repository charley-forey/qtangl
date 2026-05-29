import type { RecoveryPlan, Scoreboard } from "@/lib/airline";

import { AirlineEmptyState, AirlineSection, AirlineSectionHeader } from "./ui";
import PlanCard from "./PlanCard";

export default function RecoveryPlans({
  classicalPlan,
  hybridPlans,
  scoreboard,
  onOpenAudit,
}: {
  classicalPlan: RecoveryPlan | null;
  hybridPlans: RecoveryPlan[];
  scoreboard: Scoreboard | null;
  onOpenAudit: (planId: string) => void;
}) {
  const hasResults = classicalPlan || hybridPlans.length > 0;
  const hybridRecommended = Boolean(
    scoreboard?.hybrid.hybrid_beats_classical_objective ||
      scoreboard?.hybrid.hybrid_beats_classical_fairness
  );

  return (
    <AirlineSection>
      <AirlineSectionHeader
        label="Recovery plans"
        title="Classical assignment vs hybrid alternates"
        description="Each plan assigns crew across all open cascade legs with FAR 117 proof in the audit drawer."
      />
      {!hasResults ? (
        <div className="mt-6">
          <AirlineEmptyState
            title="Plans appear after recover"
            description="You will see one classical recovery plan and up to three hybrid alternates."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {classicalPlan ? (
            <PlanCard plan={classicalPlan} title="Classical" onOpenAudit={onOpenAudit} />
          ) : null}
          {hybridPlans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              title={`Hybrid ${index + 1}`}
              recommended={index === 0 && hybridRecommended}
              onOpenAudit={onOpenAudit}
            />
          ))}
        </div>
      )}
    </AirlineSection>
  );
}
