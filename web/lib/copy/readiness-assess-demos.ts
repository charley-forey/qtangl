export const assessPdfPreviewSections = [
  { title: "Executive summary", items: ["Q-Day readiness score and band", "Top quantum-vulnerable findings", "Mosca HNDL inequality verdict"] },
  { title: "Framework mapping", items: ["NSM-10 / CNSA 2.0 control themes", "PCI-DSS 4.0 crypto agility", "CMMC inventory expectations"] },
  { title: "Remediation backlog", items: ["Prioritized migration items", "Suggested PQC replacements", "Owner and deadline hints"] },
] as const;

export const assessVerifyPreview = {
  scanId: "sample-bank-tls-inventory",
  targetDomain: "api.regional-bank.example",
  readinessScore: 58.2,
  readinessBand: "At risk",
  signatureStatus: "valid",
  logIncluded: true,
} as const;

export const assessBoardReadoutPreview = [
  "Open with readiness score and band — not a pass/fail audit",
  "Explain Mosca inequality and HNDL exposure in plain language",
  "Show top 3 remediation items with framework citations",
  "Share verify link — auditors confirm signing independently",
] as const;

export const assessCompareTeaser = {
  eyebrow: "Why Qtangl",
  title: "Signed evidence, not discovery-only",
  description:
    "Many tools inventory TLS endpoints. Qtangl adds framework mapping, Mosca HNDL scoring, and PQ-signed reports your auditors verify at /verify — without claiming formal attestation.",
  matrixHighlight: {
    label: "Signed report + public verify",
    qtangl: true,
    typical: false,
  },
} as const;

export const assessMaturityTeaser = {
  eyebrow: "Assess → Monitor → Convert",
  stage: "Stage 1 — Baseline",
  title: "You are here: establish your crypto inventory",
  description:
    "Assess is a one-session baseline. Monitor tracks drift until Q-Day. Convert plans remediation with signed evidence.",
} as const;

export const assessMiniTeaser = {
  eyebrow: "30-second preview",
  title: "Try a vertical fixture before you run a scan",
  description:
    "Email-gated mini-assessment shows readiness score, coverage confidence, and top findings — no domain required.",
  cta: "Start mini-assessment",
  href: "/assess/mini",
} as const;

export const assessOpsNote = {
  liveLabel: "Live product:",
  liveDetail: "Fixture scenarios, OQS demo scans, and authorized production workspaces run in the scanner below.",
  opsLabel: "Ops note:",
  opsDetail:
    "Sample scenarios use offline fixtures. Live demos target approved hosts only. Production domains require an authorized workspace at /assess/start.",
} as const;

export const assessApiPreview = {
  eyebrow: "Developer API",
  title: "Automate baseline scans in CI",
  description:
    "Start inventory with POST /pqc/scan, poll GET /pqc/scan/{scanId}, and export signed PDF or CycloneDX CBOM for your GRC pipeline.",
  docsHref: "/docs/guides/assess",
} as const;
