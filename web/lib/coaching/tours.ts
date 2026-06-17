export type ProductTourStep = {
  id: string;
  title: string;
  body: string;
  targetTab?: string;
  element?: string;
};

export const PRODUCT_TOURS: Record<string, ProductTourStep[]> = {
  overview: [
    {
      id: "overview-kpi",
      title: "Readiness KPIs",
      body: "Track latest score, delta, and critical open items.",
      targetTab: "overview",
      element: '[data-tour="kpi-strip"]',
    },
    {
      id: "overview-actions",
      title: "Recommended actions",
      body: "Personalized next steps based on your scan and maturity stage.",
      targetTab: "overview",
      element: '[data-tour="action-queue"]',
    },
  ],
  scans: [
    {
      id: "scans-run",
      title: "Run baseline",
      body: "Authorize and run production or fixture scans from the Scans tab.",
      targetTab: "scans",
      element: '[data-tour="scans-runner"]',
    },
  ],
  monitor: [
    {
      id: "monitor-schedule",
      title: "Schedules",
      body: "Create weekly monitoring to catch crypto drift automatically.",
      targetTab: "monitor",
      element: '[data-tour="schedule-manager"]',
    },
    {
      id: "monitor-alerts",
      title: "Alert inbox",
      body: "Review drift and regression alerts in the bell icon.",
      targetTab: "monitor",
      element: '[data-tour="alert-bell"]',
    },
  ],
  remediate: [
    {
      id: "remediate-board",
      title: "Remediation board",
      body: "Assign owners, track status, and verify fixes with re-scans.",
      targetTab: "remediate",
      element: '[data-tour="remediation-board"]',
    },
  ],
  settings: [
    {
      id: "settings-team",
      title: "Team",
      body: "Invite Executive, Operator, and Admin teammates.",
      targetTab: "settings",
      element: '[data-tour="settings-team"]',
    },
  ],
};
