"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { hndlVerticalPresets } from "@/lib/copy/hndl-data";

const barColors = ["#6ee7a0", "#60a5fa", "#fbbf24", "#888888"];

export default function HndlShelfLifeChart() {
  const maxYears = 50;

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Data shelf-life by vertical</Eyebrow>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        Typical confidentiality horizon (X in Mosca&apos;s inequality) by industry.
      </p>
      <div
        className="mt-8 space-y-5"
        role="img"
        aria-label="Bar chart of typical data shelf-life by industry"
      >
        {hndlVerticalPresets.map((vertical, index) => {
          const widthPct = (vertical.shelfLifeYears / maxYears) * 100;
          return (
            <div key={vertical.id}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-white">{vertical.label}</span>
                <span className="text-[var(--color-gray-400)]">{vertical.shelfLifeRange}</span>
              </div>
              <div
                className="h-8 rounded-lg bg-black/40"
                role="presentation"
              >
                <div
                  className="flex h-full items-center rounded-lg px-3 text-xs font-medium text-black"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: barColors[index % barColors.length],
                    minWidth: "4rem",
                  }}
                >
                  {vertical.shelfLifeYears}y typical
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>Data shelf-life by vertical for screen readers</caption>
        <thead>
          <tr>
            <th scope="col">Industry</th>
            <th scope="col">Typical years</th>
            <th scope="col">Range</th>
          </tr>
        </thead>
        <tbody>
          {hndlVerticalPresets.map((v) => (
            <tr key={v.id}>
              <td>{v.label}</td>
              <td>{v.shelfLifeYears}</td>
              <td>{v.shelfLifeRange}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
