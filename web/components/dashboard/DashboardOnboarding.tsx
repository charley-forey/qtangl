"use client";

import Link from "next/link";

import ScanDiffPanel from "@/components/pqc/ScanDiffPanel";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import { monitorPreviewDiff, monitorPreviewTrend } from "@/lib/copy/readiness-demos";

const steps = [
  {
    step: "1",
    title: "Run production baseline",
    description: "Use the runner below with your tenant key — upload certs or scan authorized domains.",
    href: "#run-baseline",
    cta: "Run baseline below",
  },
  {
    step: "2",
    title: "Try the public demo (optional)",
    description: "Share fixture-based demos with stakeholders — separate from your tenant data.",
    href: "/assess",
    cta: "Open demo assess",
  },
  {
    step: "3",
    title: "Enable Monitor",
    description: "Schedule re-scans, diff alerts, and remediation tracking for your domain portfolio.",
    href: "/monitor",
    cta: "Monitor overview",
  },
] as const;

export default function DashboardOnboarding() {
  return (
    <div className="space-y-6">
      <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
        <Eyebrow>Your workspace</Eyebrow>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-gray-300)]">
          This is your customer home after purchase. Connect your tenant API key, run an authorized
          production baseline, then manage drift and remediation here — not on the public demo page.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-[var(--border-subtle)] bg-black/20 px-5 py-5"
            >
              <p className="font-mono text-xs text-[var(--color-gray-500)]">Step {item.step}</p>
              <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{item.description}</p>
              <Link
                href={item.href}
                className="mt-4 inline-block text-xs font-medium text-white underline underline-offset-4"
              >
                {item.cta} →
              </Link>
            </li>
          ))}
        </ol>
      </Card>

      <Card tone="panel" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Preview — Monitor tier (sample data)</Eyebrow>
        <p className="mt-3 text-sm text-[var(--color-gray-400)]">
          Illustrative drift from a weekly re-scan. Connect your key to see live tenant data.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-label mb-3">Readiness trend</p>
            <ReadinessTrend points={[...monitorPreviewTrend]} />
          </div>
          <div>
            <ScanDiffPanel diff={monitorPreviewDiff} />
          </div>
        </div>
      </Card>

      <Card tone="ghost" className="border border-[var(--border-subtle)]">
        <Eyebrow>API key vs SSO</Eyebrow>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm leading-7 text-[var(--color-gray-300)]">
          <div>
            <dt className="font-medium text-white">Tenant API key</dt>
            <dd className="mt-1 text-[var(--color-gray-400)]">
              Self-serve dashboard access and CI/automation. Stored in this browser session only.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-white">Enterprise SSO (optional)</dt>
            <dd className="mt-1 text-[var(--color-gray-400)]">
              Sign in with your IdP — Qtangl provisions a session-scoped key automatically. Best for
              regulated teams with centralized access control.
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/access" variant="secondary" size="sm">
            Request pilot key
          </Button>
          <Button href="/docs/guides/sso-setup" variant="secondary" size="sm">
            SSO setup guide
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4" id={title === "Run baseline assessment" ? "run-baseline" : undefined}>
      <h2 className="text-label border-b border-[var(--border-subtle)] pb-2 text-[var(--color-gray-500)]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
