import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import { blogPosts } from "@/lib/constants";
import { blogIndexCopy } from "@/lib/copy/articles";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog",
  title: "Blog",
  description:
    "Q-Day readiness, PQC inventory, and hybrid optimization field notes from Qtangl.",
});

type BlogPost = (typeof blogPosts)[number];

function isReadinessPost(post: BlogPost): boolean {
  return "readiness" in post && post.readiness === true;
}

const readinessPosts = blogPosts.filter(isReadinessPost);
const optimizationPosts = blogPosts.filter((post) => !isReadinessPost(post));

export default function BlogPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={blogIndexCopy.eyebrow}
        title={blogIndexCopy.title}
        description={blogIndexCopy.description}
        contentClassName="max-w-3xl"
      />

      {readinessPosts.length > 0 ? (
        <Section gap="tight">
          <Eyebrow>Q-Day readiness</Eyebrow>
          <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {readinessPosts.map((post) => (
              <FeatureCard
                key={post.slug}
                eyebrow={post.category}
                title={post.title}
                description={post.excerpt}
                href={post.href}
                ctaLabel="Read article"
                imageSrc={post.coverImage}
                imageAlt={post.coverAlt}
              >
                <p className="font-medium text-white">{post.description}</p>
              </FeatureCard>
            ))}
          </div>
        </Section>
      ) : null}

      <Section gap="tight" className="pb-0">
        <Eyebrow>Labs / expansion</Eyebrow>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
          Hybrid optimization field notes — separate from the Q-Day readiness product.
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {optimizationPosts.map((post) => (
            <FeatureCard
              key={post.slug}
              eyebrow={post.category}
              title={post.title}
              description={post.excerpt}
              href={post.href}
              ctaLabel="Read article"
              imageSrc={post.coverImage}
              imageAlt={post.coverAlt}
            >
              <p className="font-medium text-white">{post.description}</p>
            </FeatureCard>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
