/** Assess page configuration and scenario metadata. */

export const ASSESS_WIZARD_V2 =
  process.env.NEXT_PUBLIC_ASSESS_WIZARD_V2 !== "false";

/** R4 feature flags (post-MVP stubs). */
export const ASSESS_PORTFOLIO_ENABLED =
  process.env.NEXT_PUBLIC_ASSESS_PORTFOLIO === "true";
export const ASSESS_CBOM_IMPORT_ENABLED =
  process.env.NEXT_PUBLIC_ASSESS_CBOM_IMPORT === "true";
export const ASSESS_MSSP_WHITELABEL =
  process.env.NEXT_PUBLIC_ASSESS_MSSP_WHITELABEL === "true";
export const ASSESS_AI_NARRATIVE_ENABLED =
  process.env.NEXT_PUBLIC_ASSESS_AI_NARRATIVE === "true";
export const ASSESS_MONITOR_CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_ASSESS_MONITOR_CHECKOUT === "true";

/** When true, production assess mode (tenant key) is enabled on /assess and dashboard. */
export const ASSESS_PRODUCTION_MODE_ENABLED =
  process.env.NEXT_PUBLIC_ASSESS_PRODUCTION_MODE !== "false";

/** Hosts allowed for anonymous demo live scans (must match backend PUBLIC_DEMO_HOSTS). */
export const PUBLIC_DEMO_LIVE_HOSTS = new Set([
  "test.openquantumsafe.org",
  "qtangl.com",
  "www.qtangl.com",
]);

export const PRODUCTION_INDUSTRIES = [
  { id: "financial", label: "Financial services" },
  { id: "government", label: "Government / defense" },
  { id: "healthcare", label: "Healthcare" },
  { id: "other", label: "Other regulated industry" },
] as const;

export const ASSESS_RESULT_TABS = [
  "executive",
  "compliance",
  "inventory",
  "remediation",
  "technical",
  "evidence",
] as const;

export type AssessResultTab = (typeof ASSESS_RESULT_TABS)[number];

export function isAssessResultTab(value: string | null): value is AssessResultTab {
  return ASSESS_RESULT_TABS.includes(value as AssessResultTab);
}

/** Marketing scenario ids that may auto-run on deep link. */
export const AUTORUN_SCENARIO_IDS = new Set([
  "bank-tls-inventory",
  "gov-contractor-cmmc",
  "healthcare-insurer-hndl",
]);

export const SCENARIO_INDUSTRY: Record<string, string> = {
  "bank-tls-inventory": "financial",
  "gov-contractor-cmmc": "government",
  "healthcare-insurer-hndl": "healthcare",
};

export function scenarioIndustry(scenarioId: string): string {
  return SCENARIO_INDUSTRY[scenarioId] ?? "financial";
}

export const WIZARD_STEPS = [
  { id: 1, label: "Scenario" },
  { id: 2, label: "Target" },
  { id: 3, label: "Scope" },
  { id: 4, label: "Run" },
] as const;
