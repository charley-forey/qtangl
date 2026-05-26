import type { Metadata } from "next";

import DocsShell from "@/components/docs/DocsShell";
import Card from "@/components/ui/Card";
import { dataFormatGuides } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Data Formats",
  description:
    "Field-level guidance for schedule, routing, and allocation inputs in the Qtangl pilot.",
};

export default function DataFormatsPage() {
  return (
    <DocsShell
      title="Data formats"
      description="Start with the fields your team already knows. These guides show what to send for schedules, routes, and staffing jobs before you touch the live API."
    >
      <div className="grid gap-6">
        {dataFormatGuides.map((guide) => (
          <Card key={guide.problemType} className="rounded-[1.75rem]">
            <h2 className="text-2xl font-semibold text-white">{guide.title}</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {guide.intro}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {guide.fields.map((field) => (
                <div
                  key={`${guide.problemType}-${field.name}`}
                  className="rounded-2xl border border-[var(--border)] bg-black/40 p-4"
                >
                  <p className="font-mono text-sm text-white">{field.name}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                    {field.meaning}
                  </p>
                  <p className="mt-3 text-xs leading-6 text-[var(--color-gray-500)]">
                    Example: {field.example}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-black/35 p-4">
              <p className="text-label">CSV template columns</p>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {guide.csvColumns.join(", ")}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </DocsShell>
  );
}
