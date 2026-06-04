"use client";

import FeatureCard from "@/components/marketing/FeatureCard";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import { trackEvent } from "@/lib/analytics";

const audiencePaths = [
  {
    title: "For boards",
    description: "What directors miss about HNDL — Mosca inequality and migration runway.",
    href: "/blog/harvest-now-decrypt-later-boards",
    audience: "board",
  },
  {
    title: "For CISOs",
    description: "Turn X + Y > Z into a planning deadline with framework mapping.",
    href: "/blog/mosca-inequality-for-cisos",
    audience: "ciso",
  },
  {
    title: "For engineers",
    description: "TLS handshakes, archives, and what evidence to attach after migration.",
    href: "/blog/hndl-for-security-engineers",
    audience: "engineer",
  },
  {
    title: "For compliance",
    description: "Vertical HNDL guides for HIPAA, banking, and government contractors.",
    href: "/q-day/frameworks/hipaa-hndl",
    audience: "compliance",
  },
] as const;

export default function HndlAudiencePaths() {
  return (
    <Section gap="tight" id="choose-your-path">
      <div className="content-reading">
        <Eyebrow>Choose your path</Eyebrow>
        <h2 className="heading-section mt-4">Speak your language</h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
          HNDL means different things to boards, CISOs, engineers, and compliance teams. Start with
          the guide that matches your role.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {audiencePaths.map((path) => (
          <FeatureCard
            key={path.audience}
            title={path.title}
            description={path.description}
            href={path.href}
            ctaLabel="Read guide →"
            onLinkClick={() =>
              trackEvent("hndl_cta_click", {
                destination: path.href,
                placement: "audience-path",
                audience: path.audience,
              })
            }
          />
        ))}
      </div>
    </Section>
  );
}
