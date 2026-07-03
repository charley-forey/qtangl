/**
 * Command Center telemetry — typed events posted to /api/dashboard/analytics.
 */

export type DashboardTelemetryEvent =
  | { event: "cc_tab_viewed"; properties: { tab: string } }
  | { event: "cc_metric_drilled"; properties: { metric: string; tab: string; target: string } }
  | { event: "cc_chart_interacted"; properties: { chart: string; tab: string } }
  | { event: "cc_verify_opened"; properties: { remediationId: string } }
  | { event: "cc_verify_result"; properties: { remediationId: string; verified: boolean } }
  | { event: "cc_onboarding_step"; properties: { step: string; status: string } }
  | { event: "cc_upgrade_cta_clicked"; properties: { from: string; product: string } }
  | { event: "cc_upgrade_started"; properties: { product: string } }
  | { event: "cc_schedule_created"; properties: { cadenceHours: number } }
  | { event: "cc_alert_resolved"; properties: { alertId: string } }
  | { event: "cc_health_degraded_shown"; properties: { reason: string } }
  | { event: "cc_forecast_viewed"; properties: { scenario: string } }
  | { event: "cc_cadence_recommended"; properties: { recommendedCadenceHours: number } }
  | { event: "cc_cadence_applied"; properties: { cadenceHours: number } }
  | { event: "cc_incident_expanded"; properties: { incidentId: string } }
  | { event: "cc_anomaly_viewed"; properties: { count: number } }
  | { event: "cc_inbox_opened"; properties: { total: number } }
  | { event: "cc_inbox_item_clicked"; properties: { kind: string; id: string } }
  | { event: "cc_comment_added"; properties: { findingId: string } }
  | { event: "cc_comment_deleted"; properties: { findingId: string } }
  | { event: "cc_war_room_created"; properties: { alertCount: number } }
  | { event: "cc_transparency_viewed"; properties: { total: number } }
  | { event: "cc_auditor_packet_created"; properties: { scanCount: number } }
  | { event: "cc_saved_view_applied"; properties: { viewId: string } }
  | { event: "cc_saved_view_saved"; properties: { viewId: string } }
  | { event: "cc_saved_view_deleted"; properties: { viewId: string } }
  | { event: "cc_widget_reordered"; properties: { widgetId: string; toIndex: number } }
  | { event: "cc_milestone_celebrated"; properties: { milestone: string } }
  | { event: "cc_drift_intel_viewed"; properties: { available: boolean } }
  | { event: "cc_notification_prefs_saved"; properties: { minSeverity: string } }
  | { event: "cc_mobile_triage_action"; properties: { action: string; id: string } }
  | { event: "cc_webhook_saved"; properties: { eventCount: number } }
  | { event: "cc_nl_query_submitted"; properties: { intent: string; confidence: string; guardrailPassed: boolean } }
  | { event: "cc_executive_narrative_viewed"; properties: { confidence: string } }
  | { event: "cc_trust_page_shared"; properties: { url: string } }
  | { event: "cc_partner_qbr_export"; properties: { format: string; childTenantId: string } }
  | { event: "cc_ai_pr_draft"; properties: { remediationId: string } }
  | { event: "cc_agentic_plan_viewed"; properties: { remediationId: string } };

let telemetryDisabled = false;

export function setDashboardTelemetryDisabled(disabled: boolean) {
  telemetryDisabled = disabled;
}

export function trackDashboardEvent(payload: DashboardTelemetryEvent): void {
  if (telemetryDisabled || typeof window === "undefined") return;
  void fetch("/api/dashboard/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: payload.event, properties: payload.properties }),
    keepalive: true,
  }).catch(() => {
    /* best-effort */
  });
}
