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
    title: "Create your workspace",
    description: "Sign in with your work email. We provision a free Assess workspace on first login — no API key paste.",
    href: "/dashboard/login",
    cta: "Sign in with email",
  },
  {
    step: "2",
    title: "Run production baseline",
    description: "Authorized domain or certificate scan establishes your readiness score and evidence pack.",
    href: "#run-baseline",
    cta: "Run baseline",
  },
  {
    step: "3",
    title: "Enable Monitor",
    description: "Weekly re-scans, crypto drift alerts, and signed board reports from one command center.",
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
          Sign in to access your post-quantum command center — scan history, drift monitoring, readiness
          trends, and remediation workflow.
        </p>

        <div className="mt-8 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-transparent px-6 py-6">
          <p className="text-sm font-medium text-white">New here? One click to get started.</p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
            Use the same work email you want on reports. First sign-in creates your tenant automatically.
          </p>
          <Button href="/dashboard/login" className="mt-5 w-full px-8 py-3 text-base sm:w-auto">
            Sign in to get started
          </Button>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-[var(--border-subtle)] bg-black/20 px-5 py-5"
            >
              <p className="font-mono text-xs text-[var(--color-gray-500)]">Step {item.step}</p>
              <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{item.description}</p>
              {item.step === "1" ? (
                <Button href={item.href} size="sm" variant="secondary" className="mt-4">
                  {item.cta}
                </Button>
              ) : (
                <Link
                  href={item.href}
                  className="mt-4 inline-block text-xs font-medium text-white underline underline-offset-4"
                >
                  {item.cta} →
                </Link>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card tone="panel" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Preview — Monitor tier (sample data)</Eyebrow>
        <p className="mt-3 text-sm text-[var(--color-gray-400)]">
          Illustrative drift from a weekly re-scan. Sign in to see live tenant data.
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
    </div>
  );
}

export function DashboardSection({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  const sectionId =
    id ??
    (title === "Run baseline assessment"
      ? "run-baseline"
      : title === "Settings"
        ? "dashboard-settings"
        : title === "Scan history"
          ? "dashboard-scans"
          : title === "Scheduled monitoring"
            ? "dashboard-monitor"
            : undefined);

  return (
    <section className="space-y-4" id={sectionId}>
      <h2 className="text-label border-b border-[var(--border-subtle)] pb-2 text-[var(--color-gray-500)]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
