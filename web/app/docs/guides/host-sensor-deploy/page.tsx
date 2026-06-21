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
  path: "/docs/guides/host-sensor-deploy",
  title: "Host sensor deployment",
  description: "Deploy the Qtangl Unified Sensor for certificate, library, and listener discovery across your fleet.",
});

export default function HostSensorDeployGuidePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/host-sensor-deploy"
        title="Host sensor deployment"
        description="Fleet enrollment, Linux/Kubernetes install, air-gap upload, and troubleshooting."
      />
      <DocsShell
        title="Host sensor deployment"
        description="Deploy qtangl-sensor to inventory certificates, crypto libraries, and TLS listeners on hosts and endpoints."
        pathname="/docs/guides/host-sensor-deploy"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Prerequisites</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-8 text-[var(--color-gray-300)]">
            <li>
              Tenant feature flag <code className="font-mono text-white">discovery.hostSensor</code> enabled (or{" "}
              <code className="font-mono text-white">QTANGL_DISCOVERY_ENABLE_ALL=true</code> in dev)
            </li>
            <li>Monitor or Enterprise tier</li>
            <li>mTLS agent certificates issued at enrollment (production)</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>1. Create a fleet</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Open{" "}
            <Link href="/dashboard" className="text-white underline underline-offset-4">
              Dashboard → Integrations → Discovery depth
            </Link>
            , create a fleet, and copy the enrollment token. Tokens expire in 72 hours (max 100 enrollments).
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`POST /tenant/discovery/fleets
Authorization: Bearer $QTANGL_API_KEY
{"name": "Production fleet"}`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>2. Linux install</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`curl -fsSL https://releases.qtangl.com/sensor/install.sh | sudo bash
qtangl-sensor --enroll YOUR_TOKEN --api https://api.qtangl.com
# Daemon mode (heartbeat every 5m, scan every 24h)
qtangl-sensor --daemon --agent-id AGENT_ID --tenant-id TENANT_ID --api https://api.qtangl.com`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>3. Kubernetes (Helm)</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            See <code className="font-mono text-white">sensor/packaging/helm/qtangl-sensor/</code>. The init enroll Job
            writes agent credentials to a Secret consumed by the DaemonSet.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>4. Air-gap</DocsHeading>
          <pre className="overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
            {`qtangl-sensor --output findings.zip
# Upload via Dashboard or:
POST /tenant/discovery/offline-upload`}
          </pre>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Troubleshooting</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-8 text-[var(--color-gray-300)]">
            <li>
              <strong className="text-white">403 feature not enabled</strong> — contact support to enable discovery flags
            </li>
            <li>
              <strong className="text-white">401 enroll</strong> — token expired or max uses reached; rotate fleet token
            </li>
            <li>
              <strong className="text-white">401 agent mTLS</strong> — re-enroll to obtain a fresh agent certificate
            </li>
            <li>
              <strong className="text-white">Agent offline</strong> — agents silent &gt;7d marked stale; &gt;30d auto-revoked
            </li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Related</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            <Link href="/docs/reference/discovery/fleets-list" className="text-white underline underline-offset-4">
              Discovery API reference
            </Link>{" "}
            ·{" "}
            <Link href="/docs/guides/code-scan-ci" className="text-white underline underline-offset-4">
              Code scan CI
            </Link>
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
