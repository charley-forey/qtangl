import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
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

function isHndlPost(post: BlogPost): boolean {
  return "hndl" in post && post.hndl === true;
}

const featuredPost = blogPosts.find((post) => "featured" in post && post.featured === true);
const hndlPosts = blogPosts.filter(isHndlPost).filter((post) => post !== featuredPost);
const readinessPosts = blogPosts
  .filter(isReadinessPost)
  .filter((post) => post !== featuredPost && !isHndlPost(post));
const optimizationPosts = blogPosts.filter((post) => !isReadinessPost(post));

function PostGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
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
  );
}

export default function BlogPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={blogIndexCopy.eyebrow}
        title={blogIndexCopy.title}
        description={blogIndexCopy.description}
        contentClassName="max-w-3xl"
      />

      {featuredPost ? (
        <Section gap="tight">
          <Eyebrow>Featured</Eyebrow>
          <div className="mt-4">
            <FeatureCard
              eyebrow={featuredPost.category}
              title={featuredPost.title}
              description={featuredPost.excerpt}
              href={featuredPost.href}
              ctaLabel="Read featured article"
              imageSrc={featuredPost.coverImage}
              imageAlt={featuredPost.coverAlt}
            >
              <p className="font-medium text-white">{featuredPost.description}</p>
            </FeatureCard>
          </div>
        </Section>
      ) : null}

      {hndlPosts.length > 0 ? (
        <Section gap="tight">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>HNDL &amp; urgency</Eyebrow>
              <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
                Harvest-now-decrypt-later education — how ciphertext is copied, who is exposed, and what to do.
              </p>
            </div>
            <Button href="/q-day/hndl" variant="secondary" size="sm">
              HNDL hub
            </Button>
          </div>
          <PostGrid posts={hndlPosts} />
        </Section>
      ) : null}

      {readinessPosts.length > 0 ? (
        <Section gap="tight">
          <Eyebrow>Q-Day readiness</Eyebrow>
          <PostGrid posts={readinessPosts} />
        </Section>
      ) : null}

      <Section gap="tight" className="pb-0">
        <Eyebrow>Labs / expansion</Eyebrow>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
          Hybrid optimization field notes — separate from the Q-Day readiness product.
        </p>
        <PostGrid posts={optimizationPosts} />
        <p className="mt-8 text-sm text-[var(--color-gray-500)]">
          Subscribe:{" "}
          <a href="/blog/feed.xml" className="text-white underline underline-offset-4">
            Q-Day readiness RSS
          </a>
        </p>
      </Section>
    </PageShell>
  );
}
