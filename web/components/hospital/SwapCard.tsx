import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import type { HospitalCandidate } from "@/lib/hospital";

type SwapCardProps = {
  candidate: HospitalCandidate;
  title: string;
  onOpenAudit?: (candidateId: string) => void;
};

export default function SwapCard({ candidate, title, onOpenAudit }: SwapCardProps) {
  return (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label">{title}</p>
          <h4 className="mt-2 text-lg font-semibold text-white">{candidate.nurse_name}</h4>
        </div>
        <MethodBadge method={candidate.source === "classical" ? "classical" : "hybrid"} />
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{candidate.summary}</p>
      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="text-[var(--color-gray-500)]">Objective</dt>
          <dd className="mt-1 text-white">{candidate.score.objective.toFixed(4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Quantum weight</dt>
          <dd className="mt-1 text-white">
            {candidate.quantum_weight ? `${candidate.quantum_weight.toFixed(1)}%` : "n/a"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Fatigue score</dt>
          <dd className="mt-1 text-white">{candidate.score.fatigue_score.toFixed(1)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Fairness delta</dt>
          <dd className="mt-1 text-white">{candidate.score.fairness_delta.toFixed(3)}</dd>
        </div>
      </dl>
      <ul className="mt-5 space-y-2 text-sm leading-7 text-[var(--color-gray-300)]">
        {candidate.explanation.slice(0, 3).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {onOpenAudit ? (
        <div className="mt-5">
          <Button type="button" variant="secondary" onClick={() => onOpenAudit(candidate.id)}>
            Open audit pack
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
