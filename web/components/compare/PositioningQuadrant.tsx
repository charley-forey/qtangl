"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { CompetitorEntry } from "@/lib/competitors-types";
import { competitorCompareHref, qtanglBaseline } from "@/lib/copy/competitors";

const WIDTH = 560;
const HEIGHT = 400;
const PAD = { top: 36, right: 36, bottom: 52, left: 56 };

type PlotPoint = {
  slug: string;
  name: string;
  x: number;
  y: number;
  isQtangl?: boolean;
  href?: string;
};

type PositioningQuadrantProps = {
  competitors: CompetitorEntry[];
  className?: string;
};

function scaleX(x: number) {
  const inner = WIDTH - PAD.left - PAD.right;
  return PAD.left + x * inner;
}

function scaleY(y: number) {
  const inner = HEIGHT - PAD.top - PAD.bottom;
  return PAD.top + inner - y * inner;
}

export default function PositioningQuadrant({ competitors, className }: PositioningQuadrantProps) {
  const points: PlotPoint[] = [
    {
      slug: "qtangl",
      name: qtanglBaseline.name,
      x: qtanglBaseline.quadrant.x,
      y: qtanglBaseline.quadrant.y,
      isQtangl: true,
      href: "/assess",
    },
    ...competitors.map((c) => ({
      slug: c.slug,
      name: c.name,
      x: c.quadrant.x,
      y: c.quadrant.y,
      href: competitorCompareHref(c.slug),
    })),
  ];

  return (
    <Card tone="feature" size="lg" className={`rounded-[var(--radius-feature)] ${className ?? ""}`}>
      <Eyebrow>Positioning map</Eyebrow>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        Broad platform vs point tool (horizontal) and enterprise high-touch vs mid-market self-serve
        (vertical). Source: public vendor positioning, {competitors[0]?.lastValidated ?? "2026-06-06"}.
      </p>

      <div className="mt-8 w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height="auto"
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto max-w-[36rem]"
          role="img"
          aria-label="Positioning quadrant chart for PQC readiness vendors"
        >
          <rect
            x={PAD.left}
            y={PAD.top}
            width={WIDTH - PAD.left - PAD.right}
            height={HEIGHT - PAD.top - PAD.bottom}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.12)"
          />
          <line
            x1={scaleX(0.5)}
            y1={PAD.top}
            x2={scaleX(0.5)}
            y2={HEIGHT - PAD.bottom}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4 4"
          />
          <line
            x1={PAD.left}
            y1={scaleY(0.5)}
            x2={WIDTH - PAD.right}
            y2={scaleY(0.5)}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4 4"
          />
          <text x={PAD.left} y={HEIGHT - 12} fill="rgba(255,255,255,0.5)" fontSize={11}>
            Narrow (point tool)
          </text>
          <text x={WIDTH - PAD.right - 100} y={HEIGHT - 12} fill="rgba(255,255,255,0.5)" fontSize={11}>
            Broad (platform)
          </text>
          <text
            x={12}
            y={scaleY(0.85)}
            fill="rgba(255,255,255,0.5)"
            fontSize={11}
            transform={`rotate(-90 12 ${scaleY(0.85)})`}
          >
            Mid-market / self-serve
          </text>
          <text
            x={12}
            y={scaleY(0.15)}
            fill="rgba(255,255,255,0.5)"
            fontSize={11}
            transform={`rotate(-90 12 ${scaleY(0.15)})`}
          >
            Enterprise / high-touch
          </text>

          {points.map((p) => {
            const cx = scaleX(p.x);
            const cy = scaleY(p.y);
            return (
              <g key={p.slug}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={p.isQtangl ? 8 : 5}
                  fill={p.isQtangl ? "#6ee7a0" : "rgba(255,255,255,0.75)"}
                  stroke={p.isQtangl ? "#6ee7a0" : "rgba(255,255,255,0.3)"}
                  strokeWidth={1}
                />
                <text
                  x={cx + (p.isQtangl ? 12 : 8)}
                  y={cy + 4}
                  fill={p.isQtangl ? "#6ee7a0" : "rgba(255,255,255,0.7)"}
                  fontSize={p.isQtangl ? 12 : 10}
                  fontWeight={p.isQtangl ? 600 : 400}
                >
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--color-gray-400)]">
        {points.map((p) => (
          <li key={p.slug}>
            {p.href ? (
              <Link href={p.href} className="underline-offset-4 hover:text-white hover:underline">
                {p.name}
              </Link>
            ) : (
              p.name
            )}
          </li>
        ))}
      </ul>

      <table className="sr-only">
        <caption>Vendor positioning coordinates</caption>
        <thead>
          <tr>
            <th scope="col">Vendor</th>
            <th scope="col">Breadth (0-1)</th>
            <th scope="col">Self-serve (0-1)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.slug}>
              <th scope="row">{p.name}</th>
              <td>{p.x}</td>
              <td>{p.y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
