export const monitorFaqItems = [
  {
    question: "What is the difference between Assess and Monitor?",
    answer:
      "Assess is a one-time baseline inventory with signed evidence export. Monitor schedules re-scans, detects crypto drift between scans, fires alerts, and tracks readiness trends until you upgrade to Convert for remediation orchestration.",
  },
  {
    question: "Is Monitor a formal audit or certification?",
    answer:
      "No. Monitor is an inventory aid with scheduled re-scans and diff alerts — not CMMC attestation, FedRAMP authorization, or formal audit. Export signed reports auditors can verify independently at /verify.",
  },
  {
    question: "What infrastructure does scheduled monitoring require?",
    answer:
      "Scheduled re-scans require Postgres, Redis, a worker process, and QTANGL_ENABLE_SCHEDULER=true on deploy. Continuous monitoring is deployment-dependent — not implicit on every hosting tier.",
  },
  {
    question: "What alert channels are supported?",
    answer:
      "Slack incoming webhooks, Microsoft Teams webhooks, email notifications, and qtangl-webhook-v2 JSON payloads for SIEM/GRC ingestion. See /docs/integrations/siem-webhook-v2 for field mapping.",
  },
  {
    question: "What drift sources does Monitor track?",
    answer:
      "External TLS scans, host fleet findings, code/runtime drift, and CBOM component changes — unified under /tenant/drift/* when DRIFT_UNIFIED_ENABLED is on.",
  },
  {
    question: "Can MSSPs monitor multiple tenants?",
    answer:
      "Monitor tier supports portfolio rollups on the dashboard for partner accounts. Bulk digest and schedule templates are available under /tenant/partner/* endpoints.",
  },
  {
    question: "How is evidence verified?",
    answer:
      "Every report is PQ-capable signed. Share the verify link or use qtangl-verify CLI. Verification confirms report integrity and signing — not complete estate coverage.",
  },
  {
    question: "Are quantum-vulnerable algorithms broken today?",
    answer:
      "No. Quantum-vulnerable means exposure to future cryptanalytic advances — we quantify inventory risk and drift, not current breakage.",
  },
  {
    question: "What does the executive digest include?",
    answer:
      "Weekly headline, wins, risks, next-week focus, and top crypto risks — suitable for QBR prep. Preview on this page is illustrative; configure digests on your tenant dashboard.",
  },
  {
    question: "How do I start a Monitor pilot?",
    answer:
      "Request pilot access at /access or connect your API key on /dashboard. Start with an Assess baseline, then add weekly schedules for your domain portfolio.",
  },
] as const;
