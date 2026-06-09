"use client";

type Tier = "confirmed" | "reachable" | "available";

type ReachabilityTiersProps = {
  confirmed: number;
  reachable: number;
  available: number;
};

const LABELS: Record<Tier, string> = {
  confirmed: "Confirmed (direct crypto calls)",
  reachable: "Reachable (in call graph)",
  available: "Available (in deps only)",
};

export default function ReachabilityTiers({ confirmed, reachable, available }: ReachabilityTiersProps) {
  const tiers: { key: Tier; count: number; weight: string }[] = [
    { key: "confirmed", count: confirmed, weight: "High Mosca priority" },
    { key: "reachable", count: reachable, weight: "Medium priority" },
    { key: "available", count: available, weight: "Lower priority" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiers.map((t) => (
        <div key={t.key} className="rounded-lg border border-[var(--border)] p-3">
          <p className="text-2xl font-semibold">{t.count}</p>
          <p className="text-sm font-medium">{LABELS[t.key]}</p>
          <p className="text-xs text-[var(--muted)]">{t.weight}</p>
        </div>
      ))}
    </div>
  );
}
