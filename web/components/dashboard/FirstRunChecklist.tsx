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
  highlightInvite,
  onRunBaseline,
  scanAllowlist = [],
}: {
  signedIn: boolean;
  hasScans: boolean;
  hasSchedule: boolean;
  isAdmin: boolean;
  settings?: { firstRunChecklist?: ChecklistState };
  onSave: (next: ChecklistState) => Promise<void>;
  highlightInvite?: boolean;
  onRunBaseline?: () => void;
  scanAllowlist?: string[];
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
      if (id === "baseline" && !hasScans) {
        onRunBaseline?.();
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
    [autoDone, hasScans, local, onRunBaseline, onSave]
  );

  const visibleSteps = STEPS.filter((step) => step.id !== "invite" || isAdmin);
  const allDone = visibleSteps.every((step) => local[step.id] ?? autoDone[step.id]);
  if (allDone) return null;

  return (
    <Card tone="panel" className={highlightInvite ? "ring-1 ring-sky-400/40" : undefined}>
      <Eyebrow>First-run checklist</Eyebrow>
      {scanAllowlist.length > 0 ? (
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          Suggested targets: {scanAllowlist.slice(0, 3).join(", ")}
        </p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {visibleSteps.map((step) => {
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
      <div className="mt-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => onRunBaseline?.()}>
          Open scan runner
        </Button>
      </div>
    </Card>
  );
}
