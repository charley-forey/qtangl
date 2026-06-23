export const DEFAULT_ATTESTATION =
  "I am authorized to scan these domains on behalf of my organization.";

export const BATCH_QUOTA_EXPLAINER =
  "Each domain in a batch counts as one scan. Scheduled runs repeat per domain at the cadence you choose.";

export function cadenceLabel(hours: number): string {
  if (hours === 24) return "daily";
  if (hours === 168) return "weekly";
  if (hours === 336) return "bi-weekly";
  if (hours === 720) return "monthly";
  return `every ${hours}h`;
}

export function formatScheduleOutcome(opts: {
  createdCount: number;
  schedulesSkipped?: string[];
  cadenceHours?: number;
}): string | null {
  const { createdCount, schedulesSkipped = [], cadenceHours = 168 } = opts;
  const cadence = cadenceLabel(cadenceHours);
  const parts: string[] = [];
  if (createdCount > 0) {
    parts.push(`${createdCount} domain(s) scheduled ${cadence}`);
  }
  for (const domain of schedulesSkipped) {
    parts.push(`${domain} already has a ${cadence} schedule`);
  }
  if (parts.length === 0) return null;
  return parts.join(" · ");
}
