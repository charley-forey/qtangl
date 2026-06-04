/** Single-sourced HNDL statistics — pair every value with sourceId for citations. */

export type HndlVerticalId = "healthcare" | "banking" | "government" | "saas";

export type HndlVerticalPreset = {
  id: HndlVerticalId;
  label: string;
  shelfLifeYears: number;
  shelfLifeRange: string;
  migrationYearsDefault: number;
  highestRiskData: readonly string[];
  sourceId: string;
};

export type HndlCollectionVector = {
  id: string;
  label: string;
  likelihood: "high" | "medium" | "low";
  whatIsStored: string;
  sourceId: string;
};

export const hndlQuantumTimelineDefault = {
  minYears: 8,
  maxYears: 15,
  defaultYears: 10,
  sourceId: "gqi-q-day-summary" as const,
};

export const hndlExfilStat = {
  label: "Fastest-quartile intrusions reach data theft",
  valueMinutes: 72,
  sourceId: "palo-alto-q-day" as const,
};

export const hndlVerticalPresets: readonly HndlVerticalPreset[] = [
  {
    id: "healthcare",
    label: "Healthcare / payers",
    shelfLifeYears: 35,
    shelfLifeRange: "30–50 years",
    migrationYearsDefault: 7,
    highestRiskData: ["PHI archives", "Claims history", "Research datasets"],
    sourceId: "nist-pqc-overview",
  },
  {
    id: "banking",
    label: "Banking / finance",
    shelfLifeYears: 15,
    shelfLifeRange: "7–25 years",
    migrationYearsDefault: 6,
    highestRiskData: ["Transaction archives", "M&A diligence", "Wire audit logs"],
    sourceId: "nist-ir-8547",
  },
  {
    id: "government",
    label: "Government / defense",
    shelfLifeYears: 25,
    shelfLifeRange: "15–50 years",
    migrationYearsDefault: 8,
    highestRiskData: ["Classified-adjacent research", "Contract deliverables", "Personnel records"],
    sourceId: "nsm-10",
  },
  {
    id: "saas",
    label: "SaaS / tech",
    shelfLifeYears: 3,
    shelfLifeRange: "1–7 years",
    migrationYearsDefault: 4,
    highestRiskData: ["Customer backups", "Long-term API logs", "Code-signing keys"],
    sourceId: "nist-pqc-overview",
  },
] as const;

export const hndlCollectionVectors: readonly HndlCollectionVector[] = [
  {
    id: "breach_exfil",
    label: "Breach & ransomware exfiltration",
    likelihood: "high",
    whatIsStored: "Database dumps, file shares, backup appliances, misconfigured buckets",
    sourceId: "palo-alto-q-day",
  },
  {
    id: "backups_archives",
    label: "Backups & long-term archives",
    likelihood: "high",
    whatIsStored: "Tape, S3 snapshots, email archives, encrypted exports",
    sourceId: "nist-pqc-overview",
  },
  {
    id: "cloud_misconfig",
    label: "Cloud misconfiguration",
    likelihood: "medium",
    whatIsStored: "Public snapshots, open prefixes, stale database replicas",
    sourceId: "nist-pqc-overview",
  },
  {
    id: "bulk_transit",
    label: "Bulk network collection",
    likelihood: "medium",
    whatIsStored: "TLS handshakes + ciphertext on backbone/peering links",
    sourceId: "nist-pqc-overview",
  },
  {
    id: "insider_supply",
    label: "Insider & supply-chain copies",
    likelihood: "low",
    whatIsStored: "M&A data rooms, subcontractor archives, legal holds",
    sourceId: "palo-alto-q-day",
  },
] as const;

export function getHndlVerticalPreset(id: HndlVerticalId): HndlVerticalPreset {
  const preset = hndlVerticalPresets.find((v) => v.id === id);
  if (!preset) {
    return hndlVerticalPresets[0];
  }
  return preset;
}

export function moscaHolds(x: number, y: number, z: number): boolean {
  return x + y > z;
}
