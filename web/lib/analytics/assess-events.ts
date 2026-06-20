/**
 * Canonical assess funnel events. PRD aliases documented for PostHog dashboards.
 * @see roadmap/quantum-readiness/prds/assess-prd.md
 */

export const ASSESS_EVENTS = {
  landingView: "assess_landing_view",
  intentSelected: "assess_intent_selected",
  quickStart: "assess_quick_start",
  customizeToggled: "assess_customize_toggled",
  modeChanged: "assess_mode_changed",
  myDomainCta: "assess_my_domain_cta",
  blockedDomain: "assess_blocked_domain",
  wizardStep: "assess_wizard_step",
  scanStarted: "pqc_scan_started",
  scanCompleted: "pqc_scan_completed",
  scanFailed: "pqc_scan_failed",
  reportDownloaded: "pqc_report_downloaded",
  monitorProposed: "monitor_proposed",
  upgradePromptShown: "assess_upgrade_prompt_shown",
  signupStarted: "assess_signup_started",
  signupCompleted: "assess_signup_completed",
  verifyViewed: "verify_viewed",
  miniView: "mini_assessment_view",
  miniEmailCaptured: "mini_assess_email_captured",
  miniUnlock: "mini_assessment_unlock",
  miniHandoff: "mini_to_assess_handoff",
  oqsPresetApplied: "assess_oqs_preset_applied",
  shareLinkCopied: "assess_share_link_copied",
} as const;

/** PRD telemetry names → canonical event keys */
export const ASSESS_EVENT_PRD_ALIASES: Record<string, string> = {
  scan_started: ASSESS_EVENTS.scanStarted,
  scan_completed: ASSESS_EVENTS.scanCompleted,
  report_exported: ASSESS_EVENTS.reportDownloaded,
  verify_viewed: ASSESS_EVENTS.verifyViewed,
  mini_assess_email_captured: ASSESS_EVENTS.miniEmailCaptured,
  monitor_proposed: ASSESS_EVENTS.monitorProposed,
};

export type AssessIntentProp = "sample" | "live-demo" | "my-domain";

export type AssessEventProps = {
  assess_landing_view: { path: string; mode: string; intent?: AssessIntentProp };
  assess_intent_selected: { intent: AssessIntentProp };
  assess_quick_start: { intent: "sample" | "live-demo" };
  assess_customize_toggled: { open: boolean; intent?: AssessIntentProp };
  assess_mode_changed: { mode: "fixture" | "live" };
  assess_my_domain_cta: { destination: "assess_start" | "access" | "panel" };
  assess_blocked_domain: { domain: string; kind?: string };
  assess_wizard_step: { step: number; intent?: AssessIntentProp };
  pqc_scan_failed: { message: string; kind?: string; assessMode?: string };
  assess_upgrade_prompt_shown: { code: string; scanId?: string };
  mini_to_assess_handoff: { scenarioId: string; source: string };
  verify_viewed: { scanId?: string; referrer?: string };
};
