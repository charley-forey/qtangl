"use client";

type Framework = {
  framework: string;
  status: string;
  score: number;
  inScope: boolean;
};

export default function ComplianceScorecard({ frameworks }: { frameworks: Framework[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
      <p className="text-sm font-semibold text-white">Compliance scorecard</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {frameworks.map((fw) => (
          <div
            key={fw.framework}
            className={`rounded-md border px-3 py-2 ${
              fw.status === "pass"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : fw.status === "fail"
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-white/10 bg-white/5"
            }`}
          >
            <p className="text-xs uppercase text-[var(--color-gray-400)]">{fw.framework}</p>
            <p className="mt-1 text-lg font-semibold text-white">{fw.score || "—"}</p>
            <p className="text-xs capitalize text-[var(--color-gray-300)]">{fw.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
