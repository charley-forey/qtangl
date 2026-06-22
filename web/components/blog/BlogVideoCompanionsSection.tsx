import VideoCompanionCard from "@/components/learn/VideoCompanionCard";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import Link from "next/link";
import { loadVideoCompanionCatalog } from "@/lib/quantum-crypto-curriculum";

export default async function BlogVideoCompanionsSection() {
  const companions = await loadVideoCompanionCatalog();

  return (
    <Section gap="tight">
      <div className="content-reading">
        <Eyebrow>Video learning</Eyebrow>
        <h2 className="heading-section mt-4">15 video companions with embedded players.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-gray-300)]">
          Each article embeds the source video and adds practitioner takeaways, NIST citations, and
          inventory steps. Browse the full curriculum on the{" "}
          <Link href="/learn/quantum-crypto" className="text-white underline underline-offset-4">
            quantum crypto learning hub
          </Link>
          .
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {companions.slice(0, 6).map((companion) => (
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
      <p className="mt-8">
        <Link
          href="/learn/quantum-crypto#video-companions"
          className="text-sm text-white underline underline-offset-4"
        >
          View all {companions.length} video companions →
        </Link>
      </p>
    </Section>
  );
}
