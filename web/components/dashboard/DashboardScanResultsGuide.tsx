"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type Props = {
  scanId: string;
  readinessScore?: number | null;
  readinessBand?: string | null;
  onTabChange: (tab: string) => void;
  onOpenUpgrade?: (product: "assess" | "monitor") => void;
};

export default function DashboardScanResultsGuide({
  scanId,
  readinessScore,
  readinessBand,
  onTabChange,
  onOpenUpgrade,
}: Props) {
  return (
    <Card tone="feature" className="mt-4 border border-[var(--border-strong)]">
      <Eyebrow>What this means</Eyebrow>
      <p className="mt-3 text-sm text-[var(--color-gray-300)]">
        Readiness score <strong className="text-white">{readinessScore ?? "—"}</strong>
        {readinessBand ? ` (${readinessBand})` : ""}. Review findings, assign owners, and prove fixes with re-scans.
      </p>
      <Eyebrow className="mt-6">Recommended next steps</Eyebrow>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2">
        <li className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-xs">
          <p className="font-medium text-white">Enable monitoring</p>
          <p className="mt-1 text-[var(--color-gray-400)]">Schedule weekly re-scans to detect drift.</p>
          <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => onTabChange("monitor")}>
            Monitor tab
          </Button>
        </li>
        <li className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-xs">
          <p className="font-medium text-white">Remediate & verify</p>
          <p className="mt-1 text-[var(--color-gray-400)]">Close critical items and re-scan for proof.</p>
          <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => onTabChange("remediate")}>
            Remediate tab
          </Button>
        </li>
        <li className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-xs">
          <p className="font-medium text-white">Invite teammates</p>
          <p className="mt-1 text-[var(--color-gray-400)]">Add Executive and Operator roles.</p>
          <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => onTabChange("settings")}>
            Team settings
          </Button>
        </li>
        <li className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-xs">
          <p className="font-medium text-white">Export evidence</p>
          <p className="mt-1 text-[var(--color-gray-400)]">Board pack + verify link for auditors.</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={() => window.open(`/verify?scanId=${encodeURIComponent(scanId)}`, "_blank")}
          >
            Verify scan
          </Button>
        </li>
      </ol>
      {onOpenUpgrade ? (
        <Button type="button" size="sm" className="mt-4" onClick={() => onOpenUpgrade("assess")}>
          Unlock full baseline
        </Button>
      ) : null}
    </Card>
  );
}
