"use client";

import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { CompetitorEntry, RadarScores } from "@/lib/competitors-types";
import { RADAR_DIMENSION_LABELS } from "@/lib/competitors-types";
import { qtanglBaseline } from "@/lib/copy/competitors";

/** Set false to use SVG fallback if recharts misbehaves under Turbopack */
const USE_RECHARTS = true;

type CompetitorRadarProps = {
  competitor: CompetitorEntry;
};

function RadarSvgFallback({
  qtangl,
  competitor,
}: {
  qtangl: RadarScores;
  competitor: RadarScores;
}) {
  const size = 280;
  const center = size / 2;
  const maxR = size * 0.38;
  const levels = 5;
  const dims = RADAR_DIMENSION_LABELS.length;
  const angleStep = (2 * Math.PI) / dims;

  function point(score: number, index: number) {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = (score / 5) * maxR;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  function polygon(scores: RadarScores) {
    return RADAR_DIMENSION_LABELS.map(({ key }, i) => point(scores[key], i))
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ")
      .concat(" Z");
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" className="mx-auto max-w-xs" role="img">
      {Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * maxR;
        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
          />
        );
      })}
      {RADAR_DIMENSION_LABELS.map(({ label }, i) => {
        const end = point(5, i);
        return (
          <line
            key={label}
            x1={center}
            y1={center}
            x2={end.x}
            y2={end.y}
            stroke="rgba(255,255,255,0.08)"
          />
        );
      })}
      <path d={polygon(competitor)} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" />
      <path d={polygon(qtangl)} fill="rgba(110,231,160,0.2)" stroke="#6ee7a0" />
    </svg>
  );
}

export default function CompetitorRadar({ competitor }: CompetitorRadarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = RADAR_DIMENSION_LABELS.map(({ key, label }) => ({
    dimension: label,
    Qtangl: qtanglBaseline.radar[key],
    [competitor.name]: competitor.radar[key],
  }));

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Capability radar</Eyebrow>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        Relative scores (0–5) across six buyer dimensions. Qtangl vs {competitor.name}.
      </p>

      <div className="mt-6 h-72 min-h-72 w-full min-w-0" role="img" aria-label={`Radar comparison Qtangl vs ${competitor.name}`}>
        {USE_RECHARTS && mounted ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={288}>
            <RadarChart data={chartData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }} />
              <Radar
                name="Qtangl"
                dataKey="Qtangl"
                stroke="#6ee7a0"
                fill="#6ee7a0"
                fillOpacity={0.25}
              />
              <Radar
                name={competitor.name}
                dataKey={competitor.name}
                stroke="rgba(255,255,255,0.7)"
                fill="rgba(255,255,255,0.15)"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <RadarSvgFallback qtangl={qtanglBaseline.radar} competitor={competitor.radar} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--color-gray-400)]">
        <span className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-sm bg-[#6ee7a0]" /> Qtangl
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-sm bg-white/40" /> {competitor.name}
        </span>
      </div>

      <table className="sr-only">
        <caption>Radar scores Qtangl vs {competitor.name}</caption>
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            <th scope="col">Qtangl</th>
            <th scope="col">{competitor.name}</th>
          </tr>
        </thead>
        <tbody>
          {RADAR_DIMENSION_LABELS.map(({ key, label }) => (
            <tr key={key}>
              <th scope="row">{label}</th>
              <td>{qtanglBaseline.radar[key]}</td>
              <td>{competitor.radar[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
