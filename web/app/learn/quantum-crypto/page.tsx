import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import VideoCompanionCard from "@/components/learn/VideoCompanionCard";
import LearnNewsletterSignup from "@/components/learn/LearnNewsletterSignup";
import FeatureCard from "@/components/marketing/FeatureCard";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  quantumCryptoDiagrams,
  quantumCryptoLearningHubCopy,
} from "@/lib/copy/quantum-crypto-learning-hub";
import {
  loadQuantumCryptoLayers,
  loadVideoCompanionCatalog,
} from "@/lib/quantum-crypto-curriculum";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/learn/quantum-crypto",
  title: quantumCryptoLearningHubCopy.metadata.title,
  description: quantumCryptoLearningHubCopy.metadata.description,
  type: "article",
});

export default async function QuantumCryptoLearningPage() {
  const [videoCompanions, layers] = await Promise.all([
    loadVideoCompanionCatalog(),
    loadQuantumCryptoLayers(),
  ]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: quantumCryptoLearningHubCopy.metadata.title,
    description: quantumCryptoLearningHubCopy.metadata.description,
    url: "https://www.qtangl.com/learn/quantum-crypto",
    provider: {
      "@type": "Organization",
      name: "Qtangl",
      url: "https://www.qtangl.com",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "P4W",
    },
    numberOfCredits: layers.length,
    educationalLevel: "Professional",
    teaches: layers.map((layer) => layer.title),
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        eyebrow={quantumCryptoLearningHubCopy.hero.eyebrow}
        title={quantumCryptoLearningHubCopy.hero.title}
        description={quantumCryptoLearningHubCopy.hero.description}
        actions={quantumCryptoLearningHubCopy.actions}
        contentClassName="max-w-4xl"
      />

      <Section gap="tight" id="video-companions">
        <div className="content-reading">
          <Eyebrow>{quantumCryptoLearningHubCopy.videoSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{quantumCryptoLearningHubCopy.videoSection.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-gray-300)]">
            {quantumCryptoLearningHubCopy.videoSection.description}
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {videoCompanions.map((companion) => (
            <VideoCompanionCard
              key={companion.slug}
              title={companion.title}
              excerpt={companion.excerpt}
              href={companion.href}
              thumbnailUrl={companion.thumbnailUrl ?? "/qtangl-pqc-scanner-cover.svg"}
              videoTitle={companion.videoTitle}
            />
          ))}
        </div>
      </Section>

      <Section gap="tight" id="layers">
        <div className="content-reading">
          <Eyebrow>{quantumCryptoLearningHubCopy.layersSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{quantumCryptoLearningHubCopy.layersSection.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-gray-300)]">
            {quantumCryptoLearningHubCopy.layersSection.description}
          </p>
        </div>
        <div className="mt-10 space-y-8">
          {layers.map((layer, index) => (
            <Card
              key={layer.id}
              tone="feature"
              size="lg"
              className="rounded-[var(--radius-feature)]"
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                <div>
                  <p className="text-label">Layer {index + 1}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{layer.title}</h3>
                  <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
                    <span className="font-medium text-white">Checkpoint:</span> {layer.checkpoint}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {layer.blogs.map((blog) => (
                      <li key={blog.slug}>
                        <Link
                          href={blog.href}
                          className="text-sm text-white underline underline-offset-4 hover:text-[var(--color-gray-200)]"
                        >
                          {blog.kind === "video-companion" ? "Watch + read: " : "Read: "}
                          {blog.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {layer.diagramHref ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[#141414]">
                    <Image
                      src={layer.diagramHref}
                      alt={`${layer.title} diagram`}
                      fill
                      className="object-contain p-3"
                      sizes="280px"
                    />
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight" id="diagrams">
        <div className="content-reading">
          <Eyebrow>{quantumCryptoLearningHubCopy.diagramsSection.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{quantumCryptoLearningHubCopy.diagramsSection.title}</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {quantumCryptoDiagrams.map((diagram) => (
            <FeatureCard
              key={diagram.id}
              title={diagram.title}
              imageSrc={`/learn/diagrams/${diagram.id}.png`}
              imageAlt={diagram.alt}
              href={`/learn/diagrams/${diagram.id}.png`}
              ctaLabel="Open diagram"
            />
          ))}
        </div>
      </Section>

      <Section gap="tight" id="curriculum-email">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>Stay on track</Eyebrow>
          <h2 className="heading-section mt-4 !text-2xl">Get the 4-week curriculum by email.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-gray-300)]">
            Week-by-week watchlist, NIST bibliography, and checkpoint reminders — delivered to your
            inbox. Or open the{" "}
            <Link href="/learn/quantum-crypto/guide" className="text-white underline underline-offset-4">
              full printable guide
            </Link>
            .
          </p>
          <div className="mt-6">
            <LearnNewsletterSignup variant="quantum-crypto" />
          </div>
        </Card>
      </Section>

      <Section gap="tight" className="pb-0">
        <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
          <Eyebrow>{quantumCryptoLearningHubCopy.cta.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4 !text-2xl">{quantumCryptoLearningHubCopy.cta.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-gray-300)]">
            {quantumCryptoLearningHubCopy.cta.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {quantumCryptoLearningHubCopy.cta.actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  "variant" in action && action.variant === "secondary"
                    ? "inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
                    : "inline-flex rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12]"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        </Card>
      </Section>
    </PageShell>
  );
}
