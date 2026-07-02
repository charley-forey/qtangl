import Link from "next/link";

import CoverImage from "@/components/marketing/CoverImage";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { readinessJourneyPoints } from "@/lib/copy/readiness-home";

const tierHrefs: Record<string, string> = {
  Assess: "/assess",
  Monitor: "/monitor",
  Convert: "/convert",
};

export default function MonitorJourneyStrip() {
  return (
    <div className="space-y-4">
      <div className="content-reading text-center sm:text-left">
        <Eyebrow>Assess → Monitor → Convert</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          You are on <span className="text-white">Monitor</span> — continuous drift after your baseline.
        </p>
      </div>

      <Card tone="strong" className="overflow-hidden rounded-[var(--radius-feature)]">
        <div className="grid divide-y divide-[var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
          {readinessJourneyPoints.map((point) => {
            const isMonitor = point.eyebrow === "Monitor";
            const href = tierHrefs[point.eyebrow] ?? "/platform";
            return (
              <Link
                key={point.eyebrow}
                href={href}
                className={[
                  "group block px-6 py-6 transition motion-safe:duration-300 sm:px-8",
                  isMonitor
                    ? "bg-white/[0.05] ring-1 ring-inset ring-white/15"
                    : "hover:bg-white/[0.02]",
                ].join(" ")}
                aria-current={isMonitor ? "page" : undefined}
              >
                <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/30">
                  <CoverImage
                    src={point.image}
                    alt={point.imageAlt}
                    className={[
                      "object-cover grayscale transition motion-safe:duration-500",
                      isMonitor ? "opacity-100" : "opacity-80 group-hover:scale-[1.02] group-hover:opacity-95",
                    ].join(" ")}
                  />
                  {isMonitor ? (
                    <span className="absolute left-3 top-3 rounded-full border border-sky-400/40 bg-sky-500/20 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-sky-200 motion-safe:animate-pulse">
                      You are here
                    </span>
                  ) : null}
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

      <p className="text-center text-sm sm:text-left">
        <Link href="/journey" className="text-[var(--color-gray-400)] underline underline-offset-4 hover:text-white">
          Full journey map →
        </Link>
      </p>
    </div>
  );
}
