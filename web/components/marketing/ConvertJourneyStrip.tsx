import Link from "next/link";

import CoverImage from "@/components/marketing/CoverImage";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import Card from "@/components/ui/Card";
import { readinessJourneyPoints } from "@/lib/copy/readiness-home";

const tierHrefs: Record<string, string> = {
  Assess: "/assess",
  Monitor: "/monitor",
  Convert: "/convert",
};

export default function ConvertJourneyStrip() {
  return (
    <Card tone="strong" className="overflow-hidden rounded-[var(--radius-feature)]">
      <div className="grid divide-y divide-[var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
        {readinessJourneyPoints.map((point) => {
          const isConvert = point.eyebrow === "Convert";
          const href = tierHrefs[point.eyebrow] ?? "/platform";
          return (
            <Link
              key={point.eyebrow}
              href={href}
              className={[
                "group block px-6 py-6 transition sm:px-8",
                isConvert ? "bg-white/[0.04] ring-1 ring-inset ring-white/10" : "hover:bg-white/[0.02]",
              ].join(" ")}
            >
              <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/30">
                <CoverImage
                  src={point.image}
                  alt={point.imageAlt}
                  className="object-cover grayscale opacity-90 transition group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex items-center gap-2">
                <MarketingIcon name={point.icon} className="h-5 w-5 text-[var(--color-gray-400)]" />
                <span className="text-label text-[var(--color-gray-500)]">{point.eyebrow}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white group-hover:underline">{point.title}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{point.description}</p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
