import type { Metadata } from "next";

import DocsJsonLd from "@/components/docs/DocsJsonLd";
import ReferenceEndpointPage from "@/components/docs/ReferenceEndpointPage";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsEndpoints } from "@/lib/docs/endpoints";
import { buildPageMetadata } from "@/lib/seo";

const endpoint = docsEndpoints.optimize!;

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/reference/optimize",
  title: "POST /optimize",
  description: endpoint.summary,
});

export default function OptimizeReferencePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/reference/optimize"
        title={endpoint.title}
        description={endpoint.summary}
      />
      <ReferenceEndpointPage endpoint={endpoint} metadataDescription={endpoint.summary} />
    </div>
  );
}
