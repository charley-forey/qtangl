import type { Metadata } from "next";
import ReferenceEndpointPage from "@/components/docs/ReferenceEndpointPage";
import { docsEndpoints } from "@/lib/docs/endpoints";
import { buildPageMetadata } from "@/lib/seo";

const endpoint = docsEndpoints["airline-recover-solve"]!;
export const metadata: Metadata = buildPageMetadata({
  path: "/docs/reference/airline/recover-solve",
  title: endpoint.title,
  description: endpoint.summary,
});
export default function Page() {
  return <ReferenceEndpointPage endpoint={endpoint} metadataDescription={endpoint.summary} />;
}
