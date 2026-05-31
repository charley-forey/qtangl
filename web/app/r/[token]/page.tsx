import { notFound } from "next/navigation";

import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { qtanglApiBaseUrl } from "@/lib/api";

type SharePayload = {
  status: string;
  scanId: string;
  readinessBand?: string;
  targetDomain?: string;
  report?: { readinessScore?: number };
};

async function loadSharedReport(token: string): Promise<SharePayload | null> {
  const response = await fetch(`${qtanglApiBaseUrl}/r/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await loadSharedReport(token);
  if (!data) {
    notFound();
  }

  return (
    <PageShell>
      <Section>
        <div className="max-w-2xl space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Shared Q-Day report</p>
          <h1 className="text-2xl font-semibold text-white">{data.targetDomain ?? "Read-only report"}</h1>
          <p className="font-mono text-sm text-[var(--color-gray-400)]">{data.scanId}</p>
          <dl className="grid gap-3 rounded-xl border border-[var(--border-subtle)] p-4 text-sm">
            <div>
              <dt className="text-[var(--color-gray-500)]">Readiness band</dt>
              <dd className="text-white">{data.readinessBand ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-gray-500)]">Readiness score</dt>
              <dd>{data.report?.readinessScore ?? "—"}</dd>
            </div>
          </dl>
          <p className="text-xs text-[var(--color-gray-500)]">
            This link is read-only and may expire. Contact the issuing tenant for the full PDF audit pack.
          </p>
        </div>
      </Section>
    </PageShell>
  );
}
