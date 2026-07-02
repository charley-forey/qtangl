import type { Metadata } from "next";

import ConvertPageContent from "@/components/marketing/ConvertPageContent";
import PageShell from "@/components/layout/PageShell";
import JsonLd from "@/components/seo/JsonLd";
import { convertFaqItems, convertPageCopy } from "@/lib/copy/readiness-convert";
import { absoluteUrl, buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";
import { siteMetadata } from "@/lib/copy/product";

export const metadata: Metadata = buildPageMetadata({
  path: "/convert",
  title: convertPageCopy.metadata.title,
  description: convertPageCopy.metadata.description,
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteMetadata.url },
    { "@type": "ListItem", position: 2, name: "Platform", item: absoluteUrl("/platform") },
    { "@type": "ListItem", position: 3, name: "Convert", item: absoluteUrl("/convert") },
  ],
};

export default function ConvertPage() {
  return (
    <PageShell>
      <JsonLd data={buildFaqJsonLd(convertFaqItems)} />
      <JsonLd data={breadcrumbJsonLd} />
      <ConvertPageContent />
    </PageShell>
  );
}
