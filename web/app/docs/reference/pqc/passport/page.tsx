import type { Metadata } from "next";

import ReferenceEndpointPage from "@/components/docs/ReferenceEndpointPage";
import { docsEndpoints } from "@/lib/docs/endpoints";
import { buildPageMetadata } from "@/lib/seo";

const endpoint = docsEndpoints["tenant-share-create"]!;
export const metadata: Metadata = buildPageMetadata({
  path: "/docs/reference/pqc/passport",
  title: "POST /tenant/scans/{scanId}/share (passport)",
  description: endpoint.summary,
});
export default function Page() {
  return <ReferenceEndpointPage endpoint={endpoint} metadataDescription={endpoint.summary} />;
}
