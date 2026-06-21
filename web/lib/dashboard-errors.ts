import { QtanglApiError } from "@qtangl/sdk";

import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";

export type DashboardApiErrorResult = {
  message: string;
  code: string;
  upgradeProduct?: UpgradeProduct;
};

const KNOWN_CODES = [
  "legal_acceptance_required",
  "scan_quota_exceeded",
  "assess_payment_required",
  "trial_batch_limit",
  "schedule_quota_exceeded",
  "api_key_quota_exceeded",
] as const;

export type DashboardErrorCode = (typeof KNOWN_CODES)[number];

const FRIENDLY_MESSAGES: Record<DashboardErrorCode, string> = {
  legal_acceptance_required: "Accept the current Terms of Service to continue.",
  scan_quota_exceeded: "Monthly scan quota reached. Upgrade your plan to run more scans.",
  assess_payment_required: "Production scans require Assess. Complete checkout to continue.",
  trial_batch_limit: "Your trial does not include enough scans for this batch. Upgrade or scan fewer domains.",
  schedule_quota_exceeded: "Scheduled monitoring requires a higher tier. Upgrade to Monitor.",
  api_key_quota_exceeded: "API key limit reached for your tier. Upgrade for more automation keys.",
};

function isKnownCode(value: string): value is DashboardErrorCode {
  return (KNOWN_CODES as readonly string[]).includes(value);
}

function isErrorPayload(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && typeof (value as { code?: unknown }).code === "string";
}

function unwrapApiDetail(detail: unknown): Record<string, unknown> | null {
  if (isErrorPayload(detail)) {
    return detail;
  }
  if (typeof detail === "object" && detail !== null && "detail" in detail) {
    const nested = (detail as { detail: unknown }).detail;
    if (isErrorPayload(nested)) {
      return nested;
    }
    if (typeof nested === "string") {
      return { message: nested };
    }
  }
  return null;
}

export function parseDashboardApiError(error: unknown): Record<string, unknown> | null {
  if (error instanceof QtanglApiError) {
    const fromDetail = unwrapApiDetail(error.detail);
    if (fromDetail) {
      return fromDetail;
    }
    if (error.status === 402) {
      return { code: "assess_payment_required", message: error.message };
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  try {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    if (typeof parsed.code === "string") {
      return parsed;
    }
    if (typeof parsed.detail === "object" && parsed.detail !== null) {
      return parsed.detail as Record<string, unknown>;
    }
  } catch {
    /* not JSON */
  }

  const jsonStart = message.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(message.slice(jsonStart)) as Record<string, unknown>;
      if (typeof parsed.code === "string") {
        return parsed;
      }
    } catch {
      /* keep scanning */
    }
  }

  for (const code of KNOWN_CODES) {
    if (message.includes(code)) {
      return { code, message };
    }
  }
  return null;
}

function upgradeProductForCode(code: DashboardErrorCode): UpgradeProduct | undefined {
  if (code === "assess_payment_required" || code === "trial_batch_limit") {
    return "assess";
  }
  if (code === "schedule_quota_exceeded" || code === "api_key_quota_exceeded" || code === "scan_quota_exceeded") {
    return "monitor";
  }
  return undefined;
}

export function handleDashboardApiError(error: unknown): DashboardApiErrorResult {
  const parsed = parseDashboardApiError(error);
  const rawCode = typeof parsed?.code === "string" ? parsed.code : "unknown";
  const code = isKnownCode(rawCode) ? rawCode : rawCode;
  const fallbackMessage = error instanceof Error ? error.message : "Request failed.";

  if (isKnownCode(code)) {
    return {
      message: FRIENDLY_MESSAGES[code],
      code,
      upgradeProduct: upgradeProductForCode(code),
    };
  }

  return {
    message: typeof parsed?.message === "string" ? parsed.message : fallbackMessage,
    code,
  };
}
