import { qtanglApiBaseUrl } from "@/lib/api";

export type DogfoodVerification = {
  valid?: boolean;
  contentHash?: string;
  logInclusion?: { included?: boolean; seq?: number };
};

export type DogfoodScanPayload = {
  scanId?: string;
  targetDomain?: string;
  readinessBand?: string;
  readinessScore?: number;
  scannedAt?: string;
  verifyUrl?: string;
  verification?: DogfoodVerification;
  transparencyRootUrl?: string;
  contentHash?: string;
};

export type DogfoodTargetSummary = {
  targetDomain: string;
  scanId?: string | null;
  readinessScore?: number | null;
  readinessBand?: string | null;
  scannedAt?: string | null;
  stalenessDays?: number | null;
  stale?: boolean;
  missing?: boolean;
  verifyUrl?: string | null;
};

export type DogfoodSummary = {
  status?: string;
  latest?: DogfoodScanPayload | null;
  targets?: DogfoodTargetSummary[];
  freshness?: { allFresh?: boolean; staleAfterDays?: number };
};

export type DogfoodHistoryPoint = {
  scanId?: string;
  targetDomain?: string;
  readinessScore?: number;
  readinessBand?: string;
  scannedAt?: string;
};

export const DOGFOOD_STALE_DAYS = 8;

export async function fetchDogfoodSummary(): Promise<DogfoodSummary | null> {
  try {
    const response = await fetch(`${qtanglApiBaseUrl}/pqc/dogfood/summary`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as DogfoodSummary;
  } catch {
    return null;
  }
}

export async function fetchDogfoodHistory(days = 90): Promise<DogfoodHistoryPoint[]> {
  try {
    const response = await fetch(`${qtanglApiBaseUrl}/pqc/dogfood/history?days=${days}`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { points?: DogfoodHistoryPoint[] };
    return payload.points ?? [];
  } catch {
    return [];
  }
}

export function isDogfoodStale(scannedAt?: string | null): boolean {
  if (!scannedAt) return false;
  const date = new Date(scannedAt);
  if (Number.isNaN(date.getTime())) return false;
  const ageMs = Date.now() - date.getTime();
  return ageMs > DOGFOOD_STALE_DAYS * 24 * 60 * 60 * 1000;
}

export function formatDogfoodDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function isQtanglHqTenant(
  tenantSettings: Record<string, unknown> | null | undefined,
  email?: string | null
): boolean {
  if (tenantSettings?.orgType === "internal_hq" || tenantSettings?.dogfoodMirrorEnabled === true) {
    return true;
  }
  const hqId = process.env.NEXT_PUBLIC_QTANGL_HQ_TENANT_ID?.trim();
  if (hqId && tenantSettings?.tenantId === hqId) return true;
  if (email?.toLowerCase().endsWith("@qtangl.com")) return true;
  return false;
}
