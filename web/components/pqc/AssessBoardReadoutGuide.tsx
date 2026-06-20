import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const SE_SCRIPTS = [
  { label: "Bank autorun demo", href: "/assess?scenario=bank-tls-inventory&autorun=1" },
  { label: "Gov contractor scenario", href: "/assess?scenario=gov-contractor-cmmc&autorun=1" },
  { label: "Healthcare scenario", href: "/assess?scenario=healthcare-insurer-hndl&autorun=1" },
  { label: "Assess product guide", href: "/docs/guides/assess" },
] as const;

export default function AssessBoardReadoutGuide() {
  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Board readout checklist</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        Use this flow when presenting to the board or risk committee: readiness score and peer band, Mosca
        HNDL timeline, top vulnerability, remediation preview, then Evidence tab for verify link and PDF
        export.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--color-gray-400)]">
        <li>Executive tab — score, peer band, severity mix</li>
        <li>Compliance tab — framework mapping if regulators are on the call</li>
        <li>Evidence tab — share verify link; download board PDF export</li>
        <li>ROI framing — link to calculator for budget conversation</li>
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/resources/roi" variant="secondary" size="sm">
          ROI calculator
        </Button>
        <Button href="/assess/methodology" variant="secondary" size="sm">
          Scoring methodology
        </Button>
      </div>
      <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">SE demo scripts</p>
        <ul className="mt-2 space-y-2">
          {SE_SCRIPTS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-white underline underline-offset-4">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
