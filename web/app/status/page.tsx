import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  getPlatformStatus,
  platformStatusCopy,
  type PlatformState,
} from "@/lib/status";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  path: "/status",
  title: platformStatusCopy.metadata.title,
  description: platformStatusCopy.metadata.description,
});

function stateTone(state: PlatformState) {
  if (state === "operational") {
    return "text-emerald-300 border-emerald-400/30 bg-emerald-400/10";
  }
  if (state === "degraded") {
    return "text-amber-300 border-amber-400/30 bg-amber-400/10";
  }
  return "text-red-300 border-red-400/30 bg-red-400/10";
}

function componentTone(ok: boolean | null, enabled = true) {
  if (!enabled) {
    return "text-[var(--color-gray-400)]";
  }
  if (ok === true) {
    return "text-emerald-300";
  }
  if (ok === false) {
    return "text-red-300";
  }
  return "text-amber-300";
}

function componentDetail(ok: boolean | null, enabled = true) {
  const { labels } = platformStatusCopy;
  if (!enabled) {
    return labels.notConfigured;
  }
  if (ok === true) {
    return labels.operationalDetail;
  }
  if (ok === false) {
    return labels.outageDetail;
  }
  return labels.degradedDetail;
}

export default async function StatusPage() {
  const snapshot = await getPlatformStatus();
  const { labels, hero } = platformStatusCopy;
  const checkedAt = new Date(snapshot.checkedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  const components = [
    {
      name: labels.website,
      ok: true as boolean | null,
      enabled: true,
      detail: labels.operationalDetail,
    },
    {
      name: labels.api,
      ok: snapshot.basic.ok,
      enabled: true,
      detail: snapshot.basic.error ?? snapshot.basic.status ?? labels.degradedDetail,
    },
    {
      name: labels.platform,
      ok: snapshot.ready.status === "ready",
      enabled: true,
      detail: snapshot.ready.error ?? snapshot.ready.status ?? labels.degradedDetail,
    },
    {
      name: labels.database,
      ok: snapshot.ready.database,
      enabled: snapshot.ready.persistenceEnabled ?? false,
      detail: componentDetail(snapshot.ready.database, snapshot.ready.persistenceEnabled ?? false),
    },
    {
      name: labels.redis,
      ok: snapshot.ready.redis,
      enabled: snapshot.ready.redisEnabled ?? false,
      detail: componentDetail(snapshot.ready.redis, snapshot.ready.redisEnabled ?? false),
    },
    {
      name: labels.scheduler,
      ok: snapshot.ready.schedulerStale === false,
      enabled: snapshot.ready.persistenceEnabled ?? false,
      detail:
        snapshot.ready.schedulerStale === true
          ? labels.staleScheduler
          : componentDetail(snapshot.ready.schedulerStale === false, snapshot.ready.persistenceEnabled ?? false),
    },
  ];

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={[
          { href: "/docs/reference/health", label: labels.docs },
          { href: "/trust", label: labels.trust, variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <Card tone="strong" className="rounded-[var(--radius-xl)] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Eyebrow>{labels.checkedAt}</Eyebrow>
              <p className="mt-2 text-sm text-[var(--color-gray-400)]">{checkedAt} UTC</p>
            </div>
            <p
              className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${stateTone(snapshot.overall)}`}
            >
              {labels[snapshot.overall]}
            </p>
          </div>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {components.map((item) => (
            <Card key={item.name} tone="panel" className="rounded-[var(--radius-xl)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className={`mt-2 text-sm ${componentTone(item.ok, item.enabled)}`}>{item.detail}</p>
                </div>
                <span
                  className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    !item.enabled
                      ? "bg-[var(--color-gray-600)]"
                      : item.ok
                        ? "bg-emerald-400"
                        : item.ok === false
                          ? "bg-red-400"
                          : "bg-amber-400"
                  }`}
                  aria-hidden="true"
                />
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-sm leading-7 text-[var(--color-gray-400)]">
          Probes call <code className="text-white">{snapshot.apiBaseUrl}/health</code> and{" "}
          <code className="text-white">{snapshot.apiBaseUrl}/health/ready</code> on each page load.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/access">{labels.access}</Button>
          <Button href="/docs/reference/health" variant="secondary">
            {labels.docs}
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
