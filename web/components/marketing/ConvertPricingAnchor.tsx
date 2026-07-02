import Link from "next/link";

import CoverImage from "@/components/marketing/CoverImage";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { convertProcurementLinks, convertRelatedPosts } from "@/lib/copy/readiness-convert";
import { pricingPageCopy } from "@/lib/copy/readiness-pricing";

export default function ConvertPricingAnchor() {
  const tier = pricingPageCopy.tiers.find((t) => t.stage === "Convert");
  if (!tier) return null;

  return (
    <Card tone="feature" className="rounded-[var(--radius-feature)]">
      <div className="grid gap-8 lg:grid-cols-[1fr_200px] lg:items-center">
        <div>
          <Eyebrow>{tier.stage} tier</Eyebrow>
          <h3 className="heading-section mt-4">{tier.name}</h3>
          <p className="mt-2 text-2xl font-semibold text-white">{tier.price}</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-gray-300)]">{tier.description}</p>
          <ul className="mt-6 space-y-2">
            {tier.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm text-[var(--color-gray-400)]">
                <span className="text-emerald-400">✓</span>
                {h}
              </li>
            ))}
          </ul>
          {"liveToday" in tier && tier.liveToday ? (
            <p className="mt-4 text-xs text-[var(--color-gray-500)]">
              Live today: {tier.liveToday.join(" · ")}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={tier.cta.href}>{tier.cta.label}</Button>
            <Button href="/pricing" variant="secondary">
              Full pricing
            </Button>
          </div>
        </div>
        {"image" in tier && tier.image ? (
          <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/30">
            <CoverImage
              src={tier.image}
              alt={tier.imageAlt ?? tier.name}
              className="object-cover grayscale"
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function ConvertProcurementStrip() {
  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Procurement</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {convertProcurementLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-4 transition hover:border-[var(--border-strong)] hover:bg-white/[0.03]"
            >
              <p className="text-sm font-semibold text-white">{link.label}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <Eyebrow>Related reading</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {convertRelatedPosts.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="rounded-xl border border-[var(--border-subtle)] px-4 py-4 transition hover:border-[var(--border-strong)]"
            >
              <p className="text-sm font-semibold text-white hover:underline">{post.title}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
