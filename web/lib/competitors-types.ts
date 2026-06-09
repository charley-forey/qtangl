export type CompetitorTier =
  | "direct-platform"
  | "pure-play"
  | "clm-pki"
  | "consulting"
  | "open-source"
  | "status-quo";

export type MatrixCell = "yes" | "partial" | "no" | "unknown";

export type DiscoveryCoverage = {
  agentless: MatrixCell;
  host: MatrixCell;
  code: MatrixCell;
  kms: MatrixCell;
  certClm: MatrixCell;
};

export type CapabilityRow = {
  agentlessExternalScan: MatrixCell;
  hostEndpointDiscovery: MatrixCell;
  sourceCodeBinaryScan: MatrixCell;
  moscaHndlScoring: MatrixCell;
  cycloneDxCbom: MatrixCell;
  signedPublicVerify: MatrixCell;
  driftRescanDiff: MatrixCell;
  remediationWorkflow: MatrixCell;
  flipsCrypto: MatrixCell;
  midMarketSelfServe: MatrixCell;
  transparentPricing: MatrixCell;
};

export type RadarScores = {
  speed: number;
  evidence: number;
  discoveryDepth: number;
  breadth: number;
  affordability: number;
  selfServe: number;
};

export type CompetitorFaqItem = {
  question: string;
  answer: string;
};

export type CompetitorSource = {
  label: string;
  url: string;
};

export type CompetitorSeo = {
  title: string;
  description: string;
  keywords: string[];
};

export type CompetitorEntry = {
  slug: string;
  name: string;
  product: string;
  tier: CompetitorTier;
  oneLiner: string;
  theirPitch: string;
  discoveryMethod: string;
  discoveryCoverage: DiscoveryCoverage;
  strengths: string[];
  whereWeWin: string[];
  whereTheyWin: string[];
  whenToChooseThem: string;
  whenToChooseQtangl: string;
  coopetitionNote?: string;
  landThePoint: string;
  capabilities: CapabilityRow;
  radar: RadarScores;
  quadrant: { x: number; y: number };
  faq: CompetitorFaqItem[];
  seo: CompetitorSeo;
  sources: CompetitorSource[];
  lastValidated: string;
  status: "published" | "draft";
};

export type QtanglBaseline = {
  name: string;
  product: string;
  capabilities: CapabilityRow;
  radar: RadarScores;
  quadrant: { x: number; y: number };
  discoveryCoverage: DiscoveryCoverage;
};

export const CAPABILITY_LABELS: { key: keyof CapabilityRow; label: string }[] = [
  { key: "agentlessExternalScan", label: "Agentless external scan" },
  { key: "hostEndpointDiscovery", label: "Host / endpoint discovery" },
  { key: "sourceCodeBinaryScan", label: "Source-code / binary scan" },
  { key: "moscaHndlScoring", label: "Mosca HNDL scoring" },
  { key: "cycloneDxCbom", label: "CycloneDX CBOM" },
  { key: "signedPublicVerify", label: "Signed + public verify" },
  { key: "driftRescanDiff", label: "Drift / re-scan diff" },
  { key: "remediationWorkflow", label: "Remediation workflow" },
  { key: "flipsCrypto", label: "Flips crypto (overlay/CLM/KMS)" },
  { key: "midMarketSelfServe", label: "Mid-market self-serve" },
  { key: "transparentPricing", label: "Transparent pricing" },
];

export const RADAR_DIMENSION_LABELS: { key: keyof RadarScores; label: string }[] = [
  { key: "speed", label: "Time to inventory" },
  { key: "evidence", label: "Verifiable evidence" },
  { key: "discoveryDepth", label: "Discovery depth" },
  { key: "breadth", label: "Platform breadth" },
  { key: "affordability", label: "Mid-market affordability" },
  { key: "selfServe", label: "Self-serve path" },
];

export const DISCOVERY_METHOD_LABELS: { key: keyof DiscoveryCoverage; label: string }[] = [
  { key: "agentless", label: "Agentless external" },
  { key: "host", label: "Host / endpoint" },
  { key: "code", label: "Source / binary" },
  { key: "kms", label: "Key / KMS" },
  { key: "certClm", label: "Certificate / CLM" },
];

export const TIER_LABELS: Record<CompetitorTier, string> = {
  "direct-platform": "Direct PQC platform",
  "pure-play": "Pure-play inventory",
  "clm-pki": "CLM / PKI incumbent",
  consulting: "Consulting / services",
  "open-source": "Open source / DIY",
  "status-quo": "Status quo",
};
