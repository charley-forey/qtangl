import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { qtanglApiBaseUrl } from "@/lib/api";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/environments",
  title: "Environments",
  description: "Base URLs, environment variables, and deployment targets for Qtangl.",
});

export default function EnvironmentsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/operations/environments" title="Environments" description="Base URLs." />
      <DocsShell
        title="Environments & base URLs"
        description="Point your client at the correct host and keep secrets out of the browser except in the sandbox."
        pathname="/docs/operations/environments"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Production API</DocsHeading>
          <p className="font-mono text-sm text-white">https://api.qtangl.com</p>
          <p className="mt-3 text-sm text-[var(--color-gray-300)]">
            Custom domain on Railway. Override in Next.js with{" "}
            <code className="font-mono text-white">NEXT_PUBLIC_QTANGL_API_BASE_URL</code> (include
            https://). Current build resolves to{" "}
            <code className="font-mono text-white">{qtanglApiBaseUrl}</code>.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Local development</DocsHeading>
          <ul className="space-y-2 font-mono text-sm text-[var(--color-gray-300)]">
            <li>API: http://127.0.0.1:8000 (uvicorn app.main:app)</li>
            <li>Web: http://localhost:3000</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Server environment variables</DocsHeading>
          <ul className="space-y-2 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>
              <code className="font-mono text-white">QTANGL_API_KEY</code> — expected bearer token
            </li>
            <li>
              <code className="font-mono text-white">QTANGL_RATE_LIMIT_PER_MINUTE</code> — optional
            </li>
            <li>
              <code className="font-mono text-white">QTANGL_ENABLE_QAOA</code> — false recommended
              on production Railway
            </li>
            <li>
              <code className="font-mono text-white">QTANGL_CORS_ORIGINS</code> — comma-separated
              browser origins
            </li>
          </ul>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
