import type { Metadata } from "next";
import Link from "next/link";

import DemoViewTabs from "@/components/marketing/DemoViewTabs";
import TryPlanner from "@/components/marketing/TryPlanner";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { demoCatalog, demosPageCopy } from "@/lib/copy/demos";
import { sandboxPageCopy } from "@/lib/copy/try";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo",
  title: "Demos",
  description:
    "Explore Qtangl demos: hospital re-staffing live today, with construction and logistics workflows coming soon.",
});

type DemoPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DemosPage({ searchParams }: DemoPageProps) {
  const params = (await searchParams) ?? {};
  const viewParam = typeof params.view === "string" ? params.view : "";
  const activeView = viewParam === "sandbox" ? "sandbox" : "catalog";

  return (
    <PageShell>
      <PageHero
        eyebrow={demosPageCopy.eyebrow}
        title={demosPageCopy.title}
        description={demosPageCopy.description}
      />

      <Section gap="tight">
        <DemoViewTabs activeView={activeView} />
      </Section>

      {activeView === "sandbox" ? (
        <Section gap="tight" className="pb-0">
          <p className="max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {sandboxPageCopy.intro}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-gray-400)]">
            <span className="font-semibold text-white">{sandboxPageCopy.title}</span>
            {" — "}
            {sandboxPageCopy.description}{" "}
            <Link
              href={sandboxPageCopy.docsLink.href}
              className="text-white underline-offset-4 hover:underline"
            >
              {sandboxPageCopy.docsLink.label}
            </Link>
          </p>
          <div className="mt-8">
            <TryPlanner />
          </div>
        </Section>
      ) : (
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
      )}
    </PageShell>
  );
}
