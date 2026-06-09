import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { CompetitorEntry } from "@/lib/competitors-types";

type WinLoseColumnsProps = {
  competitor: CompetitorEntry;
};

export default function WinLoseColumns({ competitor }: WinLoseColumnsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
        <Eyebrow>Where Qtangl wins</Eyebrow>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          {competitor.whereWeWin.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
      <Card tone="panel" size="lg" className="rounded-[var(--radius-feature)]">
        <Eyebrow>Where {competitor.name} wins</Eyebrow>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          {competitor.whereTheyWin.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-[var(--color-gray-500)]">
          We acknowledge competitor strengths — never disparage. Choose based on your program scope.
        </p>
      </Card>
    </div>
  );
}
