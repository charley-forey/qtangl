import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/monitor-setup",
  title: "Monitor setup guide",
  description: "Deploy scheduled PQC monitoring with Redis worker, webhooks, and alert thresholds.",
});

export default function MonitorSetupGuidePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/monitor-setup"
        title="Monitor setup guide"
        description="Production scheduled scans with Postgres, Redis, and worker."
      />
      <DocsShell
        title="Monitor setup"
        description="Production scheduled scans require Postgres persistence, Redis, and a dedicated worker with the scheduler enabled."
        pathname="/docs/guides/monitor-setup"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="ga" />
        <DocsSection>
          <DocsHeading>1. Environment</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`DATABASE_URL=postgresql://...
REDIS_URL=redis://...
QTANGL_ENABLE_SCHEDULER=true
QTANGL_INLINE_JOBS=false
QTANGL_SCHEDULER_INTERVAL_SEC=60`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>2. Worker process</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Run <code className="font-mono text-white">python -m app.worker</code> on Railway or your
            orchestrator. The worker enqueues due schedules, processes the PQC scan queue, and sends onboarding
            drip emails.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>3. Health checks</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <code className="font-mono text-white">GET /health/ready</code> returns database, Redis, and
            scheduler metrics (last tick, enqueued count). Use this for uptime monitors.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>4. SIEM / webhook v2</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Payload schema <code className="font-mono text-white">qtangl-webhook-v2</code>. Sample:{" "}
            <Link href="/samples/webhook-v2-scan-complete.json" className="text-white underline underline-offset-4">
              webhook-v2-scan-complete.json
            </Link>
            . Optional HMAC headers <code className="font-mono text-white">X-Qtangl-Signature</code> when
            signing secret is set in Dashboard alert settings. Full field dictionary:{" "}
            <Link href="/docs/integrations/siem-webhook-v2" className="text-white underline underline-offset-4">
              SIEM webhook v2 docs
            </Link>
            .
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>5. Dashboard</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Configure schedules, alert thresholds, and webhook signing in{" "}
            <Link href="/dashboard" className="text-white underline underline-offset-4">
              Dashboard
            </Link>
            . Failed webhook deliveries appear in the DLQ with one-click replay.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Related</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <Link href="/monitor" className="text-white underline underline-offset-4">
              Monitor product page
            </Link>{" "}
            ·{" "}
            <Link href="/docs/guides/schedule" className="text-white underline underline-offset-4">
              Schedule API guide
            </Link>
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
