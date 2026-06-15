"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

const STEPS = [
  { id: "sign_in", label: "Sign in to workspace" },
  { id: "baseline", label: "Run authorized baseline scan" },
  { id: "schedule", label: "Enable weekly monitoring" },
  { id: "invite", label: "Invite a teammate (admin)" },
] as const;

type ChecklistState = Record<string, boolean>;

export default function FirstRunChecklist({
  signedIn,
  hasScans,
  hasSchedule,
  isAdmin,
  settings,
  onSave,
}: {
  signedIn: boolean;
  hasScans: boolean;
  hasSchedule: boolean;
  isAdmin: boolean;
  settings?: { firstRunChecklist?: ChecklistState };
  onSave: (next: ChecklistState) => Promise<void>;
}) {
  const [local, setLocal] = useState<ChecklistState>(settings?.firstRunChecklist ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocal(settings?.firstRunChecklist ?? {});
  }, [settings?.firstRunChecklist]);

  const autoDone: ChecklistState = {
    sign_in: signedIn,
    baseline: hasScans,
    schedule: hasSchedule,
  };

  const toggle = useCallback(
    async (id: string) => {
      const next = { ...local, ...autoDone, [id]: !(local[id] ?? autoDone[id]) };
      setLocal(next);
      setSaving(true);
      try {
        await onSave(next);
      } finally {
        setSaving(false);
      }
    },
    [autoDone, local, onSave]
  );

  const visibleSteps = STEPS.filter((step) => step.id !== "invite" || isAdmin);
  const completed = visibleSteps.filter(
    (step) => local[step.id] ?? autoDone[step.id]
  ).length;
  if (completed >= visibleSteps.length) {
    return null;
  }

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>First-run checklist</Eyebrow>
      <p className="mt-2 text-xs text-[var(--color-gray-400)]">
        {completed} of {visibleSteps.length} complete
      </p>
      <ul className="mt-4 space-y-2">
        {visibleSteps.map((step) => {
          const done = local[step.id] ?? autoDone[step.id];
          return (
            <li key={step.id} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(done)}
                disabled={saving || Boolean(autoDone[step.id])}
                onChange={() => toggle(step.id)}
                className="h-4 w-4"
              />
              <span className={done ? "text-[var(--color-gray-500)] line-through" : "text-white"}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
      {!hasScans ? (
        <Button href="#run-baseline" size="sm" className="mt-4">
          Start baseline
        </Button>
      ) : null}
    </Card>
  );
}
