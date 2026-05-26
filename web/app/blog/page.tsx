import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import Section from "@/components/layout/Section";
import { blogPosts } from "@/lib/constants";
import { blogIndexCopy } from "@/lib/copy/articles";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read field notes from Qtangl's quantum-aware planning stack.",
};

export default function BlogPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={blogIndexCopy.eyebrow}
        title={blogIndexCopy.title}
        description={blogIndexCopy.description}
        contentClassName="max-w-3xl"
      />
      <Section gap="tight" className="pb-0">
        {/* WORKTREE-TODO(web/components): Add shared "Back to blog" affordance and article CTA slots in ArticleLayout when docs-owned components are in scope. */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
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
