import { qtanglApiBaseUrl } from "@/lib/api";

export function normalizeDomainInput(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
}

export function domainMatchesEmail(domain: string, email: string): boolean {
  const emailDomain = email.trim().toLowerCase().split("@")[1] ?? "";
  const normalized = normalizeDomainInput(domain);
  if (!normalized || !emailDomain) return false;
  return normalized === emailDomain || normalized.endsWith(`.${emailDomain}`);
}

export function emailDomainFromAddress(email: string): string {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

export type AssessSignupResponse = {
  assessUrl?: string;
  loginUrl?: string;
  detail?: string;
  warning?: string;
  allowlistSeeded?: boolean;
  tenantId?: string;
};

export async function submitAssessSignup(payload: {
  email: string;
  company: string;
  domain: string | null;
}): Promise<AssessSignupResponse> {
  const response = await fetch(`${qtanglApiBaseUrl}/public/assess-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as AssessSignupResponse;
  if (!response.ok) {
    throw new Error(typeof body.detail === "string" ? body.detail : "Signup failed.");
  }
  return body;
}
