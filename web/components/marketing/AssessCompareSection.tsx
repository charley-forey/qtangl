import Link from "next/link";

import ComparisonCta from "@/components/compare/ComparisonCta";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { assessCompareTeaser } from "@/lib/copy/readiness-assess-demos";

export default function AssessCompareSection() {
  const { matrixHighlight } = assessCompareTeaser;

  return (
    <div className="space-y-6">
      <div className="content-reading">
        <Eyebrow>{assessCompareTeaser.eyebrow}</Eyebrow>
        <h2 className="heading-section mt-4">{assessCompareTeaser.title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
          {assessCompareTeaser.description}
        </p>
      </div>

      <Card tone="feature" className="rounded-[var(--radius-xl)]">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Assessment comparison">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
                <th className="py-3 pr-4">Capability</th>
                <th className="py-3 px-4">Qtangl</th>
                <th className="py-3 pl-4">Typical discovery tool</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-subtle)]">
                <td className="py-4 pr-4 text-white">{matrixHighlight.label}</td>
                <td className="py-4 px-4 text-emerald-300">{matrixHighlight.qtangl ? "Yes" : "No"}</td>
                <td className="py-4 pl-4 text-[var(--color-gray-400)]">
                  {matrixHighlight.typical ? "Yes" : "Rare"}
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-white">Framework mapping (NSM-10, CMMC, PCI)</td>
                <td className="py-4 px-4 text-emerald-300">Yes</td>
                <td className="py-4 pl-4 text-[var(--color-gray-400)]">Partial</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/compare">Full vendor comparison</Button>
          <Link href="/compare" className="text-sm text-[var(--color-gray-400)] underline hover:text-white">
            See positioning matrix →
          </Link>
        </div>
      </Card>

      <ComparisonCta source="assess" />
    </div>
  );
}
