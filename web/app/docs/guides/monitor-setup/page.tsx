import Link from "next/link";

import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Monitor setup guide | Qtangl Docs",
  description: "Deploy scheduled PQC monitoring with Redis worker, webhooks, and alert thresholds.",
};

export default function MonitorSetupGuidePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-12">
      <header>
        <Eyebrow>Operations</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold text-white">Monitor setup</h1>
        <p className="mt-3 text-[var(--muted)]">
          Production scheduled scans require Postgres persistence, Redis, and a dedicated worker with the
          scheduler enabled.
        </p>
      </header>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">1. Environment</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black p-4 text-xs text-[var(--color-gray-300)]">
{`DATABASE_URL=postgresql://...
REDIS_URL=redis://...
QTANGL_ENABLE_SCHEDULER=true
QTANGL_INLINE_JOBS=false
QTANGL_SCHEDULER_INTERVAL_SEC=60`}
        </pre>
      </Card>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">2. Worker process</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Run <code className="text-white">python -m app.worker</code> on Railway or your orchestrator. The
          worker enqueues due schedules and processes the PQC scan queue.
        </p>
      </Card>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">3. Health checks</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          <code className="text-white">GET /health/ready</code> returns database, Redis, and scheduler metrics
          (last tick, enqueued count). Use this for uptime monitors.
        </p>
      </Card>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">4. SIEM / webhook v2</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Payload schema <code className="text-white">qtangl-webhook-v2</code>. Sample:{" "}
          <Link href="/samples/webhook-v2-scan-complete.json" className="text-white underline">
            webhook-v2-scan-complete.json
          </Link>
          . Optional HMAC headers <code className="text-white">X-Qtangl-Signature</code> when signing secret is set in Dashboard alert settings.
          Full field dictionary:{" "}
          <Link href="/docs/integrations/siem-webhook-v2" className="text-white underline">
            SIEM webhook v2 docs
          </Link>
          .
        </p>
      </Card>

      <Card tone="panel">
        <h2 className="text-lg font-medium text-white">5. Dashboard</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Configure schedules, alert thresholds, and webhook signing in{" "}
          <Link href="/dashboard" className="text-white underline">
            Dashboard
          </Link>
          . Failed webhook deliveries appear in the DLQ with one-click replay.
        </p>
      </Card>

      <p className="text-sm text-[var(--muted)]">
        See also{" "}
        <Link href="/monitor" className="text-white underline">
          Monitor product page
        </Link>{" "}
        and{" "}
        <Link href="/docs/guides/schedule" className="text-white underline">
          schedule API guide
        </Link>
        .
      </p>
    </article>
  );
}
