export const assessDeliverableCbomSample = {
  bomFormat: "CycloneDX",
  specVersion: "1.6",
  components: [
    {
      id: "asset-tls-api",
      type: "cryptographic-asset",
      name: "api.regional-bank.example:443",
      cryptoProperties: {
        assetType: "related-crypto-material",
        relatedCryptoMaterialProperties: {
          type: "public-key",
          algorithmRef: "RSA-2048",
        },
      },
    },
    {
      id: "asset-jwks",
      type: "cryptographic-asset",
      name: "auth.regional-bank.example/jwks",
      cryptoProperties: {
        assetType: "related-crypto-material",
        relatedCryptoMaterialProperties: {
          type: "public-key",
          algorithmRef: "ECDSA-P256",
        },
      },
    },
  ],
  metadata: {
    readinessScore: 58.2,
    readinessBand: "at_risk",
    moscaInequalityHolds: true,
  },
} as const;

export type DeliverablePreviewKey =
  | "readiness"
  | "findings"
  | "mosca"
  | "frameworks"
  | "remediation"
  | "verify";

export const deliverablePreviewSections: {
  pdfTitle: string;
  pdfItems: { label: string; key: DeliverablePreviewKey }[];
}[] = [
  {
    pdfTitle: "Executive summary",
    pdfItems: [
      { label: "Q-Day readiness score and band", key: "readiness" },
      { label: "Top quantum-vulnerable findings", key: "findings" },
      { label: "Mosca HNDL inequality verdict", key: "mosca" },
    ],
  },
  {
    pdfTitle: "Framework mapping",
    pdfItems: [
      { label: "NSM-10 / CNSA 2.0 control themes", key: "frameworks" },
      { label: "PCI-DSS 4.0 crypto agility", key: "frameworks" },
      { label: "CMMC inventory expectations", key: "frameworks" },
    ],
  },
  {
    pdfTitle: "Remediation backlog",
    pdfItems: [
      { label: "Prioritized migration items", key: "remediation" },
      { label: "Suggested PQC replacements", key: "remediation" },
      { label: "Owner and deadline hints", key: "remediation" },
    ],
  },
];

export const deliverableCbomHighlights: Record<DeliverablePreviewKey, string[]> = {
  readiness: ['"readinessScore"', '"readinessBand"'],
  findings: ['"RSA-2048"', '"ECDSA-P256"', '"cryptographic-asset"'],
  mosca: ['"moscaInequalityHolds"'],
  frameworks: ['"specVersion"', '"bomFormat"'],
  remediation: ['"algorithmRef"', '"relatedCryptoMaterialProperties"'],
  verify: ['"metadata"'],
};
