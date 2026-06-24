"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { postDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";

type Props = {
  onComplete: () => void;
  onMessage?: (msg: string) => void;
  onOpenChild?: (tenantId: string) => void;
};

type Step = "profile" | "customer" | "invite" | "launch";

export default function MsspOnboardingWizard({ onComplete, onMessage, onOpenChild }: Props) {
  const [step, setStep] = useState<Step>("profile");
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0066cc");
  const [customerName, setCustomerName] = useState("");
  const [primaryDomain, setPrimaryDomain] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [childTenantId, setChildTenantId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile() {
    setBusy(true);
    setError(null);
    try {
      const current = await fetch("/api/dashboard/tenant/settings").then((r) => r.json());
      const settings = (current as { settings?: Record<string, unknown> }).settings ?? {};
      const next = {
        ...settings,
        orgType: "mssp",
        reportBranding: {
          ...((settings.reportBranding as Record<string, unknown>) ?? {}),
          companyName,
          logoUrl,
          primaryColor,
          partnerDisplayName: companyName,
        },
        portalBranding: {
          ...((settings.portalBranding as Record<string, unknown>) ?? {}),
          appName: companyName ? `${companyName} Posture` : "Security Posture",
          logoUrl,
          primaryColor,
        },
      };
      await putDashboardJson("/tenant/settings", { settings: next });
      setStep("customer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setBusy(false);
    }
  }

  async function provisionCustomer() {
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await postDashboardJson<{
        childTenantId: string;
        deepLink?: string;
      }>("/tenant/partner/provision-child", {
        customerName: customerName.trim(),
        label: customerName.trim(),
        tier: "monitor",
        primaryDomain: primaryDomain.trim() || undefined,
        inviteEmail: inviteEmail.trim() || undefined,
        inviteRole: "customer_executive",
      });
      setChildTenantId(res.childTenantId);
      setStep(inviteEmail.trim() ? "launch" : "invite");
      if (inviteEmail.trim()) setStep("launch");
      else setStep("invite");
      onMessage?.("Customer workspace created.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to provision customer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card tone="feature" className="border border-[var(--border-strong)]">
      <Eyebrow>MSSP customer onboarding</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Set up your partner brand, create a customer workspace, and invite their team — about 15 minutes.
      </p>

      {step === "profile" ? (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
            placeholder="Partner company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input
            className="w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
            placeholder="Logo URL (optional)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          <input
            className="w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
            placeholder="Primary color (#0066cc)"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
          <Button type="button" disabled={busy || !companyName.trim()} onClick={() => void saveProfile()}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === "customer" ? (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
            placeholder="Customer name (e.g. Regional Bank)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            className="w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
            placeholder="Primary domain (optional)"
            value={primaryDomain}
            onChange={(e) => setPrimaryDomain(e.target.value)}
          />
          <Button type="button" disabled={busy} onClick={() => void provisionCustomer()}>
            Create customer workspace
          </Button>
        </div>
      ) : null}

      {step === "invite" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-[var(--color-gray-300)]">Workspace {childTenantId} created.</p>
          <input
            className="w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm"
            placeholder="Customer executive email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Button type="button" onClick={() => setStep("launch")}>
            Skip invite for now
          </Button>
        </div>
      ) : null}

      {step === "launch" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-emerald-200">Customer workspace ready.</p>
          <div className="flex flex-wrap gap-2">
            {childTenantId && onOpenChild ? (
              <Button type="button" size="sm" onClick={() => onOpenChild(childTenantId)}>
                Open customer workspace
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="secondary" onClick={onComplete}>
              View portfolio
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </Card>
  );
}
