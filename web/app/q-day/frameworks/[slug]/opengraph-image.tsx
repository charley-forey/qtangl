import { notFound } from "next/navigation";

import { getFrameworkGuide } from "@/lib/copy/readiness-frameworks";
import {
  readinessOgContentType,
  readinessOgSize,
  renderReadinessOgImage,
} from "@/lib/readiness-og-image";

export const size = readinessOgSize;
export const contentType = readinessOgContentType;

type FrameworkOgImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: FrameworkOgImageProps) {
  const { slug } = await params;
  const guide = getFrameworkGuide(slug);
  if (!guide) {
    notFound();
  }

  return renderReadinessOgImage({
    eyebrow: guide.slug.endsWith("-hndl") ? "HNDL · Framework guide" : "Framework guide",
    title: guide.metadata.title,
    description: guide.metadata.description,
    footer: "Qtangl Q-Day",
    variant: guide.slug.endsWith("-hndl") ? "hndl" : "default",
  });
}
