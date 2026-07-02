import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function ConvertRoiMini() {
  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Program ROI</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        Spreadsheet inventory programs decay on first deploy. Convert attaches verify-fix proof to each
        remediation sprint — compare manual refresh cost vs a continuous migration program.
      </p>
      <p className="mt-4 text-2xl font-semibold tabular-nums text-emerald-300">
        Estimate savings with the ROI calculator
      </p>
      <Link
        href="/resources/roi"
        className="mt-6 inline-flex rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm text-white hover:bg-white/5"
      >
        Open ROI calculator →
      </Link>
    </Card>
  );
}
