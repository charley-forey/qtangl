import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { demoCatalog, demosPageCopy } from "@/lib/copy/demos";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Explore Qtangl demos: hospital re-staffing live today, with construction and logistics workflows coming soon.",
};

export default function DemosPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={demosPageCopy.eyebrow}
        title={demosPageCopy.title}
        description={demosPageCopy.description}
      />

      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {demoCatalog.map((demo) => {
            const isLive = demo.status === "live" && demo.href;

            const card = (
              <Card
                tone={isLive ? "feature" : "strong"}
                size="lg"
                interactive={Boolean(isLive)}
                className={[
                  "h-full rounded-[var(--radius-feature)]",
                  !isLive ? "opacity-60" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <Eyebrow>{demo.sector}</Eyebrow>
                  <span className="text-label text-white/70">
                    {demo.status === "live" ? "Live" : "Coming soon"}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">
                  {demo.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  {demo.oneLiner}
                </p>
                {demo.runtime ? (
                  <p className="mt-4 text-label text-white">{demo.runtime} walkthrough</p>
                ) : null}
                {isLive ? (
                  <p className="mt-6 text-sm font-medium text-white">Open demo →</p>
                ) : null}
              </Card>
            );

            if (isLive && demo.href) {
              return (
                <Link
                  key={demo.slug}
                  href={demo.href}
                  className="block focus-visible:outline-none"
                >
                  {card}
                </Link>
              );
            }

            return <div key={demo.slug}>{card}</div>;
          })}
        </div>
      </Section>
    </PageShell>
  );
}
