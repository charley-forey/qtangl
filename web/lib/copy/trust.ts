/**
 * Single source of truth for trust center contacts, SLAs, and compliance language.
 * Import here instead of hardcoding security@ / privacy@ across pages.
 */

export const primaryContactEmail = "charley@qtangl.com";

/** Until email aliases are configured, all role addresses route to primary. */
export const securityContactEmail = primaryContactEmail;
export const privacyContactEmail = primaryContactEmail;
export const generalContactEmail = primaryContactEmail;

export const securityDisclosureSubject = "[SECURITY]";
export const privacyRequestSubject = "[PRIVACY]";

export const disclosureAckSlaBusinessDays = 2;

export const disclosureRemediationSlas = {
  critical: "30 days",
  high: "60 days",
  medium: "90 days",
} as const;

export const coordinatedDisclosureDays = 90;

/** SOC 2 — CPA attestation required; do not claim certification until report in hand. */
export const soc2StatusSafe =
  "SOC 2 Type I observation is in progress. We do not claim SOC 2 certification on marketing pages until an independent CPA report is available under NDA.";

export const soc2StatusForbiddenPhrases = [
  "SOC 2 certified",
  "SOC 2 compliant",
  "SOC 2 Type I certified",
] as const;

export const soc2ObservationTarget =
  "Target: Type I observation → Type I CPA report → Type II window.";

/** Dogfood copy — set live after production CI passes (see trust program tracker). */
export const dogfoodLiveEnabled = true;

export const dogfoodCopy = dogfoodLiveEnabled
  ? "Qtangl runs daily live PQC scans of qtangl.com, www.qtangl.com, and api.qtangl.com in CI. Signed reports are publicly verifiable — we hold ourselves to the standard we sell."
  : "Qtangl is enabling live self-scans of our own domains in production CI. Until live dogfood is configured, verify any scan at /verify or run your own assessment at /assess.";

export const subprocessorsLastUpdated = "2026-06-21";

export const dataRetentionMonthsDefault = 12;

export const federalTrustBlurb =
  "Qtangl helps customers with CISA ACDI-style cryptographic discovery and inventory (NIST SP 1800-38B methods). We map findings to NSM-10, NIST IR 8547, and CNSA 2.0 frameworks — as an inventory aid for customer compliance programs, not as Qtangl attestation or certification.";

export const infrastructureAssuranceBlurb =
  "Primary hosting providers maintain SOC 2 reports; subprocessor attestations are available under NDA on document request. See /trust/subprocessors.";

export function mailtoSecurityReport(): string {
  return `mailto:${securityContactEmail}?subject=${encodeURIComponent(securityDisclosureSubject)}`;
}

export function mailtoPrivacyRequest(): string {
  return `mailto:${privacyContactEmail}?subject=${encodeURIComponent(privacyRequestSubject)}`;
}
