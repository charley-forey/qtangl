import { trackEvent } from "@/lib/analytics";
import { ASSESS_EVENTS } from "@/lib/analytics/assess-events";

export function trackAssessLandingCta(source: string, href: string) {
  trackEvent(ASSESS_EVENTS.landingCtaClick, { source, href });
}

export function trackAssessSectionView(sectionId: string) {
  trackEvent(ASSESS_EVENTS.sectionView, { sectionId });
}

export function trackAssessVerifyLink(referrer: string, href: string) {
  trackEvent(ASSESS_EVENTS.verifyViewed, { referrer, href });
}

export function trackAssessReportPrinted(scanId?: string) {
  trackEvent(ASSESS_EVENTS.reportPrinted, { scanId });
}
