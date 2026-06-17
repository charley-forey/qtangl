"use client";

import { useCallback, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { DashboardOnboarding } from "@/lib/dashboard-bff";
import { patchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";

type WizardStep = "company" | "baseline" | "schedule" | "invite";

const STEP_ORDER: WizardStep[] = ["company", "baseline", "schedule", "invite"];

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
  onDismiss: () => void;
  onRenamed: (name: string) => void;
  onOpenScans: () => void;
  onOpenMonitor: () => void;
  onOpenTeam: () => void;
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
  onDismiss,
  onRenamed,
  onOpenScans,
  onOpenMonitor,
  onOpenTeam,
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
  const [saving, setSaving] = useState(false);

  const saveCompany = useCallback(async () => {
    setSaving(true);
    try {
      const payload = await patchDashboardJson<{ tenantName: string }>("/tenant/workspace", {
        name: companyName.trim(),
      });
      onRenamed(payload.tenantName);
      if (domain.trim()) {
        await postDashboardJson("/tenant/authorized-domains", {
          domains: [domain.trim()],
          attestation: "I am authorized to scan these domains for my organization.",
        });
      }
      setStep("baseline");
      onMessage?.("Workspace saved.");
    } catch (exc) {
      onMessage?.(exc instanceof Error ? exc.message : "Unable to save workspace.");
    } finally {
      setSaving(false);
    }
  }, [companyName, domain, onMessage, onRenamed]);

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
          onClick={onDismiss}
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
              Primary domain (optional)
            </label>
            <input
              className="mt-2 w-full rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
            />
          </div>
          <Button type="button" disabled={saving || !companyName.trim()} onClick={() => void saveCompany()}>
            Continue
          </Button>
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
                <Button href="/monitor" size="sm">
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
                <Button type="button" variant="secondary" onClick={onDismiss}>
                  Finish setup
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--color-gray-300)]">
                Team invites are available on Monitor tier. You can finish setup and upgrade later from Settings.
              </p>
              <Button type="button" onClick={onDismiss}>
                Finish setup
              </Button>
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}
