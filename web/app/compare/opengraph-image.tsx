import {
  comparisonOgContentType,
  comparisonOgSize,
  renderComparisonOgImage,
} from "@/lib/comparison-og-image";
import { compareHubCopy } from "@/lib/copy/competitors";

export const size = comparisonOgSize;
export const contentType = comparisonOgContentType;

export default function OpenGraphImage() {
  return renderComparisonOgImage({
    title: compareHubCopy.metadata.title,
    description: compareHubCopy.metadata.description,
    footer: "Qtangl Compare",
  });
}
