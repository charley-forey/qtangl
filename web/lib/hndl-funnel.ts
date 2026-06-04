export type HndlFunnelParams = {
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
};

export function buildAssessMiniHref({
  source,
  medium = "hndl",
  campaign = "q-day-readiness",
  content,
}: HndlFunnelParams): string {
  const search = new URLSearchParams();
  search.set("utm_source", source);
  search.set("utm_medium", medium);
  search.set("utm_campaign", campaign);
  if (content) {
    search.set("utm_content", content);
  }
  search.set("source", source);
  return `/assess/mini?${search.toString()}`;
}

export function readMiniAssessmentFunnel(searchParams: URLSearchParams) {
  const source =
    searchParams.get("source") ??
    searchParams.get("utm_source") ??
    "mini-assessment-direct";

  return {
    source,
    utmSource: searchParams.get("utm_source"),
    utmMedium: searchParams.get("utm_medium"),
    utmCampaign: searchParams.get("utm_campaign"),
    utmContent: searchParams.get("utm_content"),
  };
}
