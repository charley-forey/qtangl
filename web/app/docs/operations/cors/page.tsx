import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/cors",
  title: "CORS",
  description: "Browser CORS allow-list for qtangl.com and local development.",
});

export default function CorsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/operations/cors" title="CORS" description="CORS policy." />
      <DocsShell
        title="CORS"
        description="Browser calls from the marketing site and sandbox require explicit origins."
        pathname="/docs/operations/cors"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Default allow-list</DocsHeading>
          <ul className="font-mono text-sm text-[var(--color-gray-300)]">
            <li>https://www.qtangl.com</li>
            <li>https://qtangl.com</li>
            <li>http://localhost:3000</li>
            <li>http://127.0.0.1:3000</li>
            <li>https://*.vercel.app (preview deployments)</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Custom origins</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Set <code className="font-mono text-white">QTANGL_CORS_ORIGINS</code> to a
            comma-separated list on the backend. For regex-based previews, use{" "}
            <code className="font-mono text-white">QTANGL_CORS_ORIGIN_REGEX</code>.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Server-to-server</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            CORS applies to browsers only. Backend integrations should call the API directly without
            CORS preflight concerns.
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
