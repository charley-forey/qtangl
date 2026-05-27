import type { HospitalCandidate, Scoreboard } from "@/lib/hospital";

import { HospitalEmptyState, HospitalSection, HospitalSectionHeader } from "./ui";
import SwapCard from "./SwapCard";

type CandidatePlansProps = {
  classicalCandidate: HospitalCandidate | null;
  hybridCandidates: HospitalCandidate[];
  scoreboard: Scoreboard | null;
  onOpenAudit: (candidateId: string) => void;
};

export default function CandidatePlans({
  classicalCandidate,
  hybridCandidates,
  scoreboard,
  onOpenAudit,
}: CandidatePlansProps) {
  const hasResults = classicalCandidate || hybridCandidates.length > 0;
  const hybridRecommended = Boolean(
    scoreboard?.hybrid.hybrid_beats_classical_objective ||
      scoreboard?.hybrid.hybrid_beats_classical_fairness
  );

  return (
    <HospitalSection>
      <HospitalSectionHeader
        label="Staffing plans"
        title="Classical pick vs hybrid alternates"
        description="Each card is feasible, rule-checked, and opens a full audit pack for compliance."
      />
      {!hasResults ? (
        <div className="mt-6">
          <HospitalEmptyState
            title="Plans appear after solve"
            description="You will see one classical assignment and up to three hybrid alternates."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {classicalCandidate ? (
            <SwapCard
              candidate={classicalCandidate}
              title="Classical"
              onOpenAudit={onOpenAudit}
            />
          ) : null}
          {hybridCandidates.map((candidate, index) => (
            <SwapCard
              key={candidate.id}
              candidate={candidate}
              title={`Hybrid ${index + 1}`}
              recommended={index === 0 && hybridRecommended}
              onOpenAudit={onOpenAudit}
            />
          ))}
        </div>
      )}
    </HospitalSection>
  );
}
