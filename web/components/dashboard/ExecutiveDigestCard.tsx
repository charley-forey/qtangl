import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export type WeeklyDigest = {
  headline: string;
  wins: string[];
  risks: string[];
  nextWeekFocus: string[];
};

export default function ExecutiveDigestCard({ digest }: { digest: WeeklyDigest | null }) {
  if (!digest) {
    return null;
  }

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Executive digest</Eyebrow>
      <p className="mt-3 text-sm text-white">{digest.headline}</p>
      {digest.wins.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-emerald-300/90">Wins</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-[var(--color-gray-400)]">
            {digest.wins.slice(0, 3).map((win) => (
              <li key={win}>{win}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {digest.risks.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-amber-200/90">Risks</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-[var(--color-gray-400)]">
            {digest.risks.slice(0, 3).map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {digest.nextWeekFocus.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-sky-200/90">Next week</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-[var(--color-gray-400)]">
            {digest.nextWeekFocus.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
