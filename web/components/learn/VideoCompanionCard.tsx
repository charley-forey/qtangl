import Link from "next/link";

import CoverImage from "@/components/marketing/CoverImage";
import Card from "@/components/ui/Card";

type VideoCompanionCardProps = {
  title: string;
  excerpt: string;
  href: string;
  thumbnailUrl: string;
  videoTitle?: string;
};

export default function VideoCompanionCard({
  title,
  excerpt,
  href,
  thumbnailUrl,
  videoTitle,
}: VideoCompanionCardProps) {
  return (
    <Card
      as="article"
      tone="feature"
      size="lg"
      interactive
      className="group relative h-full rounded-[var(--radius-feature)]"
    >
      <div className="relative">
        <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black">
          <CoverImage
            src={thumbnailUrl}
            alt={videoTitle?.trim() || `${title} video thumbnail`}
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
            <span className="rounded-full border border-white/30 bg-black/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white">
              Watch + read
            </span>
          </span>
        </div>
        <p className="text-label">Video companion</p>
        <h3 className="mt-3 text-lg font-semibold text-white">
          <Link
            href={href}
            className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{excerpt}</p>
        <p className="mt-5 text-sm font-medium text-white">Open article →</p>
      </div>
    </Card>
  );
}
