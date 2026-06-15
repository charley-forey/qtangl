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
    title: "Sign in to your workspace",
    description: "Use your work email or enterprise SSO. Admins can invite teammates after first login.",
    href: "/dashboard/login",
    cta: "Sign in",
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
          trends, and remediation workflow. Automation API keys live under Settings → Advanced.
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
        <Button href="/dashboard/login" className="mt-6">
          Sign in to get started
        </Button>
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
