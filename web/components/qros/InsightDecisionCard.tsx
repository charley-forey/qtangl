import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TrustVerifyLink from "@/components/qros/TrustVerifyLink";

type Props = {
  title: string;
  whatChanged: string;
  whyItMatters: string;
  nextAction: string;
  ctaLabel: string;
  onCta: () => void;
  scanId?: string | null;
};

export default function InsightDecisionCard({
  title,
  whatChanged,
  whyItMatters,
  nextAction,
  ctaLabel,
  onCta,
  scanId,
}: Props) {
  return (
    <Card tone="panel" className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <TrustVerifyLink scanId={scanId} />
      </div>
      <dl className="mt-3 space-y-2 text-xs">
        <div>
          <dt className="text-[var(--color-gray-500)]">What changed</dt>
          <dd className="text-[var(--color-gray-200)]">{whatChanged}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Why it matters</dt>
          <dd className="text-[var(--color-gray-200)]">{whyItMatters}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Next action</dt>
          <dd className="text-[var(--color-gray-200)]">{nextAction}</dd>
        </div>
      </dl>
      <Button type="button" variant="secondary" className="mt-4" onClick={onCta}>
        {ctaLabel}
      </Button>
    </Card>
  );
}
