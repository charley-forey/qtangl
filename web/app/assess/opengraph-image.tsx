import { assessPageCopy } from "@/lib/copy/readiness-assess";
import {
  readinessOgContentType,
  readinessOgSize,
  renderReadinessOgImage,
} from "@/lib/readiness-og-image";

export const size = readinessOgSize;
export const contentType = readinessOgContentType;

export default function OpenGraphImage() {
  return renderReadinessOgImage({
    eyebrow: assessPageCopy.hero.eyebrow,
    title: assessPageCopy.hero.title,
    description: assessPageCopy.metadata.description,
    footer: "Qtangl Assess",
  });
}
