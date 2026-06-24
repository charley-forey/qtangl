"use client";

import Link from "next/link";
import { useState } from "react";

import MsspPortfolioPanel from "@/components/dashboard/MsspPortfolioPanel";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { postDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";
import type { PortfolioTabBundle } from "@/lib/dashboard-state";
import {
  PARTNER_TIER_LABELS,
  tierMeetsMinimum,
  type PartnerProgramInfo,
  type PartnerTier,
} from "@/lib/partner-tiers";

type Props = {
  portfolioBundle?: PortfolioTabBundle | null;
  program?: PartnerProgramInfo | null;
  onRefresh?: () => void;
};

function TierGate({
  required,
  program,
  children,
  fallback,
}: {
  required: PartnerTier;
  program?: PartnerProgramInfo | null;
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const tier = program?.partnerTier ?? "registered";
  if (tierMeetsMinimum(tier, required)) return <>{children}</>;
  return <>{fallback}</>;
}

export default function PartnerPortalClient({ portfolioBundle, program, onRefresh }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dealCompany, setDealCompany] = useState("");
  const [dealEmail, setDealEmail] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealNotes, setDealNotes] = useState("");

  const tier = program?.partnerTier ?? "registered";
  const tierLabel = PARTNER_TIER_LABELS[tier];
  const atLimit = program?.atChildLimit ?? false;
  const childCount = program?.childrenCount ?? portfolioBundle?.children?.length ?? 0;
  const maxChildren = program?.limits.maxChildren;

  async function enableDigestAll() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await postDashboardJson<{ updatedChildTenants?: string[] }>(
        "/tenant/partner/bulk/weekly-digest",
        { enabled: true }
      );
      setMessage(`Weekly digest enabled on ${res.updatedChildTenants?.length ?? 0} customer workspace(s).`);
      trackDashboardEvent("partner_bulk_digest", { count: res.updatedChildTenants?.length ?? 0 });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Bulk digest failed");
    } finally {
      setBusy(false);
    }
  }

  async function applyScheduleTemplate() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await postDashboardJson<{ created?: Array<{ childTenantId: string }> }>(
        "/tenant/partner/bulk/schedule-template",
        { cadenceHours: 168, scenarioId: "qtangl-baseline" }
      );
      setMessage(`Weekly baseline schedule created on ${res.created?.length ?? 0} customer workspace(s).`);
      trackDashboardEvent("partner_bulk_schedule", { count: res.created?.length ?? 0 });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Schedule template failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitDeal() {
    if (!dealCompany.trim() || !dealEmail.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      await postDashboardJson("/tenant/partner/deal-registration", {
        companyName: dealCompany.trim(),
        contactEmail: dealEmail.trim(),
        estimatedValue: dealValue.trim() || undefined,
        notes: dealNotes.trim() || undefined,
      });
      trackDashboardEvent("partner_deal_registered", { company: dealCompany.trim() });
      setMessage("Deal registered — our partner team will follow up.");
      setDealCompany("");
      setDealEmail("");
      setDealValue("");
      setDealNotes("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Deal registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>Partner command center</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold text-white">Portfolio operations</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
          Manage customer health, bulk digest settings, QBR exports, and deal registration from one place.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-sky-500/40 bg-sky-950/30 px-3 py-1 text-sky-200">
            {tierLabel} partner
          </span>
          {maxChildren != null ? (
            <span className="text-[var(--color-gray-400)]">
              {childCount} / {maxChildren} customer workspaces
            </span>
          ) : (
            <span className="text-[var(--color-gray-400)]">{childCount} customer workspaces</span>
          )}
          <Link href="/dashboard?tab=portfolio" className="text-sky-300 underline">
            Open full dashboard portfolio tab
          </Link>
        </div>
        {atLimit ? (
          <p className="mt-2 text-sm text-amber-200">
            Customer workspace limit reached for {tierLabel} tier. Upgrade to Advanced or Premier to add more customers.
          </p>
        ) : null}
        {tier === "registered" ? (
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Upgrade to Advanced for portal branding, customer invites, and higher workspace limits.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card tone="panel" className="lg:col-span-1">
          <Eyebrow>Bulk actions</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Enable weekly executive digest on all linked customer workspaces.
          </p>
          <Button type="button" className="mt-4" size="sm" disabled={busy} onClick={() => void enableDigestAll()}>
            Enable digest on all children
          </Button>
          <TierGate
            required="advanced"
            program={program}
            fallback={
              <p className="mt-2 text-xs text-[var(--color-gray-500)]">
                Weekly baseline schedule template requires Advanced tier or higher.
              </p>
            }
          >
            <Button
              type="button"
              className="mt-2"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void applyScheduleTemplate()}
            >
              Apply weekly baseline schedule
            </Button>
          </TierGate>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="/api/dashboard/tenant/partner/portfolio-board?format=pdf"
              className="text-sm text-sky-300 underline"
              onClick={() => trackDashboardEvent("partner_portfolio_board_export", { format: "pdf" })}
            >
              Download merged portfolio board PDF
            </a>
            <a
              href="/api/dashboard/tenant/partner/portfolio-board?format=csv"
              className="text-sm text-sky-300 underline"
              onClick={() => trackDashboardEvent("partner_portfolio_board_export", { format: "csv" })}
            >
              Export QBR CSV
            </a>
            <TierGate
              required="advanced"
              program={program}
              fallback={
                <span className="text-sm text-[var(--color-gray-500)]">Usage export CSV — Advanced tier</span>
              }
            >
              <a href="/api/dashboard/tenant/partner/usage-export" className="text-sm text-sky-300 underline">
                Usage export CSV
              </a>
            </TierGate>
            <TierGate
              required="advanced"
              program={program}
              fallback={
                <span className="text-sm text-[var(--color-gray-500)]">Portal branding — Advanced tier</span>
              }
            >
              <Link href="/dashboard?tab=settings" className="text-sm text-sky-300 underline">
                Configure portal branding
              </Link>
            </TierGate>
            <TierGate
              required="premier"
              program={program}
              fallback={
                <span className="text-sm text-[var(--color-gray-500)]">Custom domain — Premier tier</span>
              }
            >
              <Link href="/docs/runbooks/premier-custom-domain" className="text-sm text-sky-300 underline">
                Premier custom domain runbook
              </Link>
            </TierGate>
          </div>
        </Card>

        <Card tone="panel" className="lg:col-span-2">
          <Eyebrow>Deal registration</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Register a new end-customer opportunity for co-selling and tier upgrades.
          </p>
          {!program?.limits.customerInvites && tier === "registered" ? (
            <p className="mt-2 text-xs text-amber-200/90">
              Customer executive invites require Advanced tier — deal registration still routes to partner ops.
            </p>
          ) : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
              placeholder="Company name"
              value={dealCompany}
              onChange={(e) => setDealCompany(e.target.value)}
            />
            <input
              className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
              placeholder="Contact email"
              value={dealEmail}
              onChange={(e) => setDealEmail(e.target.value)}
            />
            <input
              className="rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm sm:col-span-2"
              placeholder="Estimated value (optional)"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
            />
            <textarea
              className="min-h-[80px] rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm sm:col-span-2"
              placeholder="Notes (optional)"
              value={dealNotes}
              onChange={(e) => setDealNotes(e.target.value)}
            />
          </div>
          <Button
            type="button"
            className="mt-3"
            size="sm"
            disabled={busy || !dealCompany.trim() || !dealEmail.trim()}
            onClick={() => void submitDeal()}
          >
            Register deal
          </Button>
        </Card>
      </div>

      {message ? <p className="text-sm text-emerald-200">{message}</p> : null}

      <MsspPortfolioPanel
        bundle={portfolioBundle}
        onSwitchTenant={onRefresh}
        canAdmin={!atLimit || tier !== "registered"}
      />
    </div>
  );
}
