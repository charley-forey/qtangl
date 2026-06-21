"use client";

import { useCallback, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { DashboardOnboarding } from "@/lib/dashboard-bff";
import { patchDashboardJson, postDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";
import LegalAcceptancePanel from "@/components/dashboard/LegalAcceptancePanel";
import ReadinessTrend from "@/components/pqc/ReadinessTrend";

type WizardStep = "company" | "learn" | "trial" | "baseline" | "schedule" | "invite";

const STEP_ORDER: WizardStep[] = ["company", "learn", "trial", "baseline", "schedule", "invite"];

const INDUSTRY_OPTIONS = [
  { id: "financial", label: "Financial services" },
  { id: "healthcare", label: "Healthcare" },
  { id: "government", label: "Government" },
  { id: "general", label: "General / other" },
] as const;

function stepIndex(step: WizardStep): number {
  return STEP_ORDER.indexOf(step);
}

type Props = {
  tenantName: string;
  tier: string;
  canInvite: boolean;
  onboarding: DashboardOnboarding | null;
  hasScans: boolean;
  hasSchedule: boolean;
  scanAllowlist?: string[];
  industry?: string;
  onDismiss: () => void;
  onComplete?: () => void;
  onRenamed: (name: string) => void;
  onOpenScans: () => void;
  onOpenMonitor: () => void;
  onOpenTeam: () => void;
  onOpenUpgrade?: (product: "assess" | "monitor") => void;
  onMessage?: (message: string) => void;
};

export default function OnboardingWizard({
  tenantName,
  tier,
  canInvite,
  onboarding,
  hasScans,
  hasSchedule,
  scanAllowlist = [],
  industry = "financial",
  onDismiss,
  onComplete,
  onRenamed,
  onOpenScans,
  onOpenMonitor,
  onOpenTeam,
  onOpenUpgrade,
  onMessage,
}: Props) {
  const initialStep = useMemo<WizardStep>(() => {
    if (onboarding?.nextStep === "schedule") return "schedule";
    if (onboarding?.nextStep === "invite") return "invite";
    if (hasScans) return hasSchedule ? "invite" : "schedule";
    return "company";
  }, [hasScans, hasSchedule, onboarding?.nextStep]);

  const [step, setStep] = useState<WizardStep>(initialStep);
  const [companyName, setCompanyName] = useState(tenantName);
  const [domain, setDomain] = useState(scanAllowlist[0] ?? "");
  const [selectedIndustry, setSelectedIndustry] = useState(industry);
  const [saving, setSaving] = useState(false);

  const finishWizard = useCallback(async () => {
    await patchDashboardJson("/tenant/onboarding", { complete: true, dismissed: true });
    onComplete?.();
    onDismiss();
  }, [onComplete, onDismiss]);

  const saveCompany = useCallback(async () => {
    setSaving(true);
    try {
      const payload = await patchDashboardJson<{ tenantName: string }>("/tenant/workspace", {
        name: companyName.trim(),
      });
      onRenamed(payload.tenantName);
      await putDashboardJson("/tenant/settings", { industry: selectedIndustry });
      if (domain.trim()) {
        await patchDashboardJson("/tenant/authorized-domains", {
          action: "add",
          domain: domain.trim(),
          attestation: "I am authorized to scan these domains for my organization.",
        });
      }
      setStep("learn");
      await patchDashboardJson("/tenant/onboarding", { step: "learn" });
      onMessage?.("Workspace saved.");
    } catch (exc) {
      onMessage?.(exc instanceof Error ? exc.message : "Unable to save workspace.");
    } finally {
      setSaving(false);
    }
  }, [companyName, domain, onMessage, onRenamed, selectedIndustry]);

  if (onboarding?.complete) {
    return null;
  }

  const current = stepIndex(step);

  return (
    <Card tone="feature" className="border border-sky-500/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Eyebrow>Welcome — set up your workspace</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-300)]">
            Complete these steps to run your first assessment and enable monitoring.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void patchDashboardJson("/tenant/onboarding", { dismissed: true }).then(onDismiss)}
          className="text-xs text-[var(--color-gray-500)] underline underline-offset-4"
        >
          Skip for now
        </button>
      </div>

      <ol className="mt-6 flex flex-wrap gap-2">
        {STEP_ORDER.map((item, index) => (
          <li
            key={item}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium",
              index <= current ? "bg-white/10 text-white" : "bg-white/[0.03] text-[var(--color-gray-500)]",
            ].join(" ")}
          >
            {index + 1}. {item}
          </li>
        ))}
      </ol>

      {step === "company" ? (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              Company name
            </label>
            <input
              className="mt-2 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              Industry
            </label>
            <select
              className="mt-2 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-black text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              Primary domain (optional)
            </label>
            <input
              className="mt-2 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
            />
          </div>
          <LegalAcceptancePanel
            requireScanAuthorization={Boolean(domain.trim())}
            domain={domain.trim()}
            onAccepted={() => {
              void saveCompany();
            }}
          />
        </div>
      ) : null}

      {step === "learn" ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-[var(--color-gray-300)]">
            Your readiness score measures quantum-vulnerable cryptography across live endpoints. Trends and signed
            evidence help auditors verify progress without trusting a spreadsheet.
          </p>
          <ReadinessTrend
            points={[
              { scanId: "sample-1", createdAt: "2026-01-01", readinessScore: 42, readinessBand: "at-risk" },
              { scanId: "sample-2", createdAt: "2026-02-01", readinessScore: 58, readinessBand: "developing" },
              { scanId: "sample-3", createdAt: "2026-03-01", readinessScore: 71, readinessBand: "on-track" },
            ]}
          />
          <Button
            type="button"
            onClick={() => {
              setStep("trial");
              void patchDashboardJson("/tenant/onboarding", { step: "trial" });
            }}
          >
            Continue
          </Button>
        </div>
      ) : null}

      {step === "trial" ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-[var(--color-gray-300)]">
            Run one free trial scan to preview findings. Production baseline unlocks signed PDF, CBOM export, and board
            report.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={onOpenScans}>
              Run trial scan
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep("baseline");
                void patchDashboardJson("/tenant/onboarding", { step: "baseline" });
              }}
            >
              Skip to baseline
            </Button>
          </div>
        </div>
      ) : null}

      {step === "baseline" ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-[var(--color-gray-300)]">
            Run an authorized baseline scan to establish your readiness score and evidence pack.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={onOpenScans}>
              Run baseline scan
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenUpgrade?.("assess")}>
              Purchase production baseline
            </Button>
            {hasScans ? (
              <Button type="button" variant="secondary" onClick={() => setStep("schedule")}>
                Continue
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === "schedule" ? (
        <div className="mt-6 space-y-4">
          {tier === "free" ? (
            <>
              <p className="text-sm text-[var(--color-gray-300)]">
                Weekly re-scans and drift alerts require Monitor tier. Upgrade when you are ready, or continue with
                manual scans on Assess.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" size="sm" onClick={() => onOpenUpgrade?.("monitor")}>
                  Upgrade to Monitor
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setStep("invite")}>
                  Continue on Assess
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--color-gray-300)]">
                Create a recurring monitor schedule for automated posture checks.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={onOpenMonitor}>
                  {hasSchedule ? "View schedules" : "Create schedule"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setStep("invite")}>
                  Continue
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {step === "invite" ? (
        <div className="mt-6 space-y-4">
          {canInvite ? (
            <>
              <p className="text-sm text-[var(--color-gray-300)]">
                Invite teammates to share scan history, remediation workflows, and board reports.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={onOpenTeam}>
                  Invite teammate
                </Button>
                <Button type="button" variant="secondary" onClick={() => void finishWizard()}>
                  Finish setup
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--color-gray-300)]">
                Team invites are available on Monitor tier. You can finish setup and upgrade later from Settings.
              </p>
              <Button type="button" onClick={() => void finishWizard()}>
                Finish setup
              </Button>
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}
