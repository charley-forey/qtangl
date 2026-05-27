import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSchemaViewer from "@/components/docs/DocsSchemaViewer";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import {
  optimizeRequestJsonSchema,
  optimizeResponseJsonSchema,
} from "@/lib/docs/schemas";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/reference/schemas",
  title: "JSON schemas",
  description: "Canonical optimize request and response JSON Schema from the backend contracts.",
});

export default function SchemasPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/reference/schemas"
        title="JSON schemas"
        description="Optimize request and response schemas."
      />
      <DocsShell
        title="JSON schemas"
        description="Imported from backend/contracts — the docs cannot drift from what the API validates."
        pathname="/docs/reference/schemas"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading id="optimize-request">Optimize request</DocsHeading>
          <DocsSchemaViewer schema={optimizeRequestJsonSchema} title="optimize-request.schema.json" />
        </DocsSection>
        <DocsSection>
          <DocsHeading id="optimize-response">Optimize response</DocsHeading>
          <DocsSchemaViewer
            schema={optimizeResponseJsonSchema}
            title="optimize-response.schema.json"
          />
        </DocsSection>
      </DocsShell>
    </div>
  );
}
