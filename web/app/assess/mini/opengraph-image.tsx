import { miniAssessmentCopy } from "@/lib/copy/readiness-value";
import {
  readinessOgContentType,
  readinessOgSize,
  renderReadinessOgImage,
} from "@/lib/readiness-og-image";

export const size = readinessOgSize;
export const contentType = readinessOgContentType;

export default function OpenGraphImage() {
  return renderReadinessOgImage({
    eyebrow: "Free mini-assessment",
    title: miniAssessmentCopy.hero.title,
    description: miniAssessmentCopy.metadata.description,
    footer: "Qtangl Assess",
  });
}
