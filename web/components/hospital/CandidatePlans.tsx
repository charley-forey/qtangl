import Card from "@/components/ui/Card";
import type { HospitalCandidate } from "@/lib/hospital";

import SwapCard from "./SwapCard";

type CandidatePlansProps = {
  classicalCandidate: HospitalCandidate | null;
  hybridCandidates: HospitalCandidate[];
  onOpenAudit: (candidateId: string) => void;
};

export default function CandidatePlans({
  classicalCandidate,
  hybridCandidates,
  onOpenAudit,
}: CandidatePlansProps) {
  return (
    <div className="space-y-6">
      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <p className="text-label">Candidate plans</p>
        <h3 className="mt-3 text-xl font-semibold text-white">
          Compare the deterministic classical pick with the hybrid alternates
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
          The live CP-SAT run still picks one best plan. The hybrid path is valuable because it
          surfaces multiple feasible alternates with different fairness and fatigue trade-offs.
        </p>
      </Card>
      <div className="grid gap-4 xl:grid-cols-4">
        {classicalCandidate ? (
          <SwapCard
            candidate={classicalCandidate}
            title="Classical pick"
            onOpenAudit={onOpenAudit}
          />
        ) : null}
        {hybridCandidates.map((candidate, index) => (
          <SwapCard
            key={candidate.id}
            candidate={candidate}
            title={`Hybrid alternate ${index + 1}`}
            onOpenAudit={onOpenAudit}
          />
        ))}
      </div>
    </div>
  );
}
