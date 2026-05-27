import Card from "@/components/ui/Card";
import type { HospitalCandidate, Scoreboard } from "@/lib/hospital";

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
  return (
    <div className="space-y-6">
      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <p className="text-label">Candidate plans</p>
        <h3 className="mt-3 text-xl font-semibold text-white">
          Compare the deterministic classical pick with the hybrid alternates
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
          The classical pass picks one plan (often from the ward board only). Hybrid sampling
          surfaces multiple feasible alternates—sometimes with better fairness or a lower composite
          score when cross-trained floats enter the repair window.
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
            recommended={
              index === 0 &&
              Boolean(
                scoreboard?.hybrid.hybrid_beats_classical_objective ||
                  scoreboard?.hybrid.hybrid_beats_classical_fairness
              )
            }
            onOpenAudit={onOpenAudit}
          />
        ))}
      </div>
    </div>
  );
}
