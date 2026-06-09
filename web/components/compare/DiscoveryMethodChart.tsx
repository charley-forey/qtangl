"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { CompetitorEntry, DiscoveryCoverage, MatrixCell } from "@/lib/competitors-types";
import { DISCOVERY_METHOD_LABELS } from "@/lib/competitors-types";
import { qtanglBaseline } from "@/lib/copy/competitors";
import { matrixCellLabel } from "@/lib/compare/matrix-utils";

type DiscoveryMethodChartProps = {
  competitors: CompetitorEntry[];
  focusSlug?: string;
};

const CELL_COLORS: Record<MatrixCell, string> = {
  yes: "#6ee7a0",
  partial: "#fbbf24",
  no: "rgba(255,255,255,0.08)",
  unknown: "rgba(255,255,255,0.04)",
};

function coverageScore(cell: MatrixCell): number {
  if (cell === "yes") return 1;
  if (cell === "partial") return 0.5;
  return 0;
}

export default function DiscoveryMethodChart({ competitors, focusSlug }: DiscoveryMethodChartProps) {
  const rows = focusSlug
    ? [
        { name: qtanglBaseline.name, coverage: qtanglBaseline.discoveryCoverage, isQtangl: true },
        ...competitors
          .filter((c) => c.slug === focusSlug)
          .map((c) => ({ name: c.name, coverage: c.discoveryCoverage, isQtangl: false })),
      ]
    : [
        { name: qtanglBaseline.name, coverage: qtanglBaseline.discoveryCoverage, isQtangl: true },
        ...competitors.slice(0, 8).map((c) => ({
          name: c.name,
          coverage: c.discoveryCoverage,
          isQtangl: false,
        })),
      ];

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Discovery method coverage</Eyebrow>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        No single discovery method is complete — NIST guidance recommends combining 2–3. Each vendor
        anchors to a primary method with characteristic blind spots.
      </p>

      <div
        className="mt-8 overflow-x-auto"
        role="img"
        aria-label="Discovery method coverage heatmap by vendor"
      >
        <div
          className="grid gap-1 text-xs"
          style={{
            gridTemplateColumns: `minmax(8rem, 1.2fr) repeat(${DISCOVERY_METHOD_LABELS.length}, minmax(4.5rem, 1fr))`,
          }}
        >
          <div />
          {DISCOVERY_METHOD_LABELS.map(({ label }) => (
            <div
              key={label}
              className="px-1 py-2 text-center text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]"
            >
              {label}
            </div>
          ))}

          {rows.map((row) => (
            <div key={row.name} className="contents">
              <div
                className={`flex items-center py-2 pr-2 ${row.isQtangl ? "font-semibold text-[#6ee7a0]" : "text-white"}`}
              >
                {row.name}
              </div>
              {DISCOVERY_METHOD_LABELS.map(({ key }) => {
                const cell = row.coverage[key as keyof DiscoveryCoverage];
                return (
                  <div
                    key={`${row.name}-${key}`}
                    className="flex items-center justify-center rounded-md border border-[var(--border)] p-2"
                    style={{ backgroundColor: CELL_COLORS[cell] }}
                    title={`${row.name}: ${matrixCellLabel(cell)}`}
                  >
                    <span className={cell === "yes" || cell === "partial" ? "text-black/80" : "text-[var(--color-gray-500)]"}>
                      {matrixCellLabel(cell).charAt(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--color-gray-400)]">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#6ee7a0]" /> Yes
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#fbbf24]" /> Partial
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-white/[0.08]" /> No
        </span>
      </div>

      <table className="sr-only">
        <caption>Discovery method coverage</caption>
        <thead>
          <tr>
            <th scope="col">Vendor</th>
            {DISCOVERY_METHOD_LABELS.map(({ label }) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              {DISCOVERY_METHOD_LABELS.map(({ key }) => (
                <td key={key}>{row.coverage[key as keyof DiscoveryCoverage]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
