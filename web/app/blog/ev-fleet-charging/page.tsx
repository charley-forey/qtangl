import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import JsonLd from "@/components/seo/JsonLd";
import { buildBlogPostingJsonLd, buildPageMetadata } from "@/lib/seo";

const title = "EV depot charging is a QUBO-shaped problem";
const description =
  "Why last-mile fleets leave hundreds of dollars per day on the table—and how hybrid staggering attacks peak demand and TOU.";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog/ev-fleet-charging",
  title,
  description,
  type: "article",
});

export default function EvFleetBlogPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Blog" title={title} description={description} />
      <Section>
        <article className="prose prose-invert max-w-3xl text-[var(--color-gray-300)]">
          <p>
            A 50-van depot can leave $400–900 per day on the table by charging during peak TOU and
            spiking site demand. The coupling between <em>who plugs in when</em> and{" "}
            <em>how many kilowatts hit the meter</em> is small enough for a hybrid micro-solve—and
            honest enough to show in an audit pack.
          </p>
          <p>
            <Link href="/demo/ev-fleet" className="text-white underline">
              Try the live demo
            </Link>{" "}
            or read the{" "}
            <Link href="/docs/guides/ev-fleet-demo" className="text-white underline">
              API guide
            </Link>
            .
          </p>
        </article>
      </Section>
      <JsonLd
        data={buildBlogPostingJsonLd({
          path: "/blog/ev-fleet-charging",
          headline: title,
          description,
          datePublished: "2026-05-28",
        })}
      />
    </PageShell>
  );
}
