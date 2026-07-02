import type { Metadata } from "next";

import MonitorPageContent from "@/components/marketing/MonitorPageContent";
import PageShell from "@/components/layout/PageShell";
import JsonLd from "@/components/seo/JsonLd";
import { monitorFaqItems } from "@/lib/copy/readiness-monitor-faq";
import { monitorPageCopy } from "@/lib/copy/readiness-monitor";
import { absoluteUrl, buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/monitor",
  title: monitorPageCopy.metadata.title,
  description: monitorPageCopy.metadata.description,
  image: "/opengraph-image",
});

export default function MonitorPage() {
  return (
    <PageShell>
      <MonitorPageContent />
      <JsonLd data={buildFaqJsonLd(monitorFaqItems)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Qtangl Monitor",
          applicationCategory: "SecurityApplication",
          description: monitorPageCopy.metadata.description,
          offers: {
            "@type": "Offer",
            url: absoluteUrl("/pricing"),
          },
        }}
      />
    </PageShell>
  );
}
