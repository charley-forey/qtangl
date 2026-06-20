"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { TakeTourButton } from "@/components/dashboard/ProductTour";

const PHASE_1_STEPS = [
  { id: "sign_in", label: "Sign in to workspace" },
  { id: "baseline", label: "Run authorized baseline scan" },
  { id: "schedule", label: "Enable weekly monitoring" },
  { id: "invite", label: "Invite a teammate (admin)" },
] as const;

const PHASE_2_STEPS = [
  { id: "verify", label: "Verify a signed report" },
  { id: "digest", label: "Enable weekly digest" },
  { id: "webhooks", label: "Configure webhooks" },
] as const;

const HQ_STEPS = [
  { id: "dogfood_verify", label: "Review latest dogfood scan" },
  { id: "dogfood_ci", label: "Confirm dogfood CI freshness is green" },
] as const;

type ChecklistState = Record<string, boolean>;

export default function FirstRunChecklist({
  signedIn,
  hasScans,
  hasSchedule,
  isAdmin,
  settings,
  milestones,
  coachingPhase,
  webhookConfigured,
  digestEnabled,
  toursCompleted = [],
  onSave,
  highlightInvite,
  onRunBaseline,
  onOpenSettings,
  scanAllowlist = [],
  isHq = false,
}: {
  signedIn: boolean;
  hasScans: boolean;
  hasSchedule: boolean;
  isAdmin: boolean;
  settings?: { firstRunChecklist?: ChecklistState };
  milestones?: Record<string, string>;
  coachingPhase?: string;
  webhookConfigured?: boolean;
  digestEnabled?: boolean;
  toursCompleted?: string[];
  onSave: (next: ChecklistState) => Promise<void>;
  highlightInvite?: boolean;
  onRunBaseline?: () => void;
  onOpenSettings?: () => void;
  scanAllowlist?: string[];
  isHq?: boolean;
}) {
  const [local, setLocal] = useState<ChecklistState>(settings?.firstRunChecklist ?? {});
  const [saving, setSaving] = useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);

  useEffect(() => {
    setLocal(settings?.firstRunChecklist ?? {});
  }, [settings?.firstRunChecklist]);

  const phase1AutoDone: ChecklistState = {
    sign_in: signedIn,
    baseline: hasScans,
    schedule: hasSchedule,
  };

  const phase2AutoDone: ChecklistState = {
    verify: Boolean(milestones?.firstVerifyAt),
    digest: Boolean(milestones?.digestEnabledAt || digestEnabled),
    webhooks: Boolean(webhookConfigured),
  };

  const phase1Steps = PHASE_1_STEPS.filter((step) => step.id !== "invite" || isAdmin);
  const phase1Done = phase1Steps.every((step) => local[step.id] ?? phase1AutoDone[step.id]);
  const showPhase2 = phase1Done || coachingPhase === "phase_2";
  const steps = showPhase2
    ? [...phase1Steps, ...PHASE_2_STEPS, ...(isHq ? HQ_STEPS : [])]
    : [...phase1Steps, ...(isHq ? HQ_STEPS : [])];

  const autoDone = useMemo(
    () => ({ ...phase1AutoDone, ...(showPhase2 ? phase2AutoDone : {}) }),
    [phase1AutoDone, phase2AutoDone, showPhase2]
  );

  const toggle = useCallback(
    async (id: string) => {
      if (id === "baseline" && !hasScans) {
        onRunBaseline?.();
      }
      if (id === "digest" || id === "webhooks") {
        onOpenSettings?.();
      }
      if (id === "dogfood_verify") {
        window.open("/trust/dogfood", "_blank", "noopener,noreferrer");
      }
      if (id === "dogfood_ci") {
        window.open("/ops/dogfood", "_blank", "noopener,noreferrer");
      }
      const next = { ...local, ...autoDone, [id]: !(local[id] ?? autoDone[id]) };
      setLocal(next);
      setSaving(true);
      try {
        await onSave(next);
      } finally {
        setSaving(false);
      }
    },
    [autoDone, hasScans, local, onOpenSettings, onRunBaseline, onSave]
  );

  const allDone = steps.every((step) => local[step.id] ?? autoDone[step.id]);
  if (allDone) return null;

  return (
    <Card tone="panel" className={highlightInvite ? "ring-1 ring-sky-400/40" : undefined}>
      <Eyebrow>{showPhase2 ? "Next steps" : "First-run checklist"}</Eyebrow>
      {scanAllowlist.length > 0 ? (
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          Suggested targets: {scanAllowlist.slice(0, 3).join(", ")}
        </p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {steps.map((step) => {
          const done = local[step.id] ?? autoDone[step.id];
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={saving}
                onClick={() => void toggle(step.id)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm",
                  done
                    ? "border-emerald-500/30 text-emerald-200/90"
                    : step.id === "invite" && highlightInvite
                      ? "border-sky-400/40 text-white"
                      : "border-[var(--border-subtle)] text-[var(--color-gray-300)]",
                ].join(" ")}
              >
                <span aria-hidden>{done ? "✓" : "○"}</span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => onRunBaseline?.()}>
          Open scan runner
        </Button>
        {activeTour ? (
          <TakeTourButton tourId={activeTour} completed={toursCompleted} onStart={() => setActiveTour(null)} />
        ) : (
          <button type="button" className="text-xs text-sky-400 underline" onClick={() => setActiveTour("overview")}>
            Take product tour
          </button>
        )}
      </div>
    </Card>
  );
}
