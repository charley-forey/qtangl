import { cadenceLabel } from "@/lib/copy/baseline";

export const monitorCopy = {
  recentActivity: {
    title: "Recent activity",
    empty: "No alerts or drift yet. Enable weekly monitoring to catch crypto changes between assessments.",
    emptyCta: "Set up monitoring",
  },
  advanced: {
    toggle: "Advanced monitoring",
    description: "Integrations, webhooks, CBOM drift, host fleet, and portfolio analytics.",
  },
  scheduleSuccess: {
    title: "Schedule active",
    runAgain: "Add another schedule",
    viewScans: "View scan history",
  },
  primary: {
    upgradeTitle: "Scheduled monitoring",
    upgradeBody: "Upgrade to Monitor for automated re-scans, drift alerts, and evidence continuity.",
  },
} as const;

export function formatNextRun(iso: string | null | undefined): string {
  if (!iso) return "Pending first run";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function scheduleSuccessMessage(target: string, cadenceHours: number): string {
  return `${target} — ${cadenceLabel(cadenceHours)} monitoring enabled`;
}
