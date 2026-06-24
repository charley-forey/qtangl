export type PartnerTier = "registered" | "advanced" | "premier";

export type PartnerTierLimits = {
  maxChildren: number | null;
  portalBranding: boolean;
  customDomain: boolean;
  customerInvites: boolean;
};

export type PartnerProgramInfo = {
  partnerTier: PartnerTier;
  limits: PartnerTierLimits;
  childrenCount: number;
  atChildLimit: boolean;
};

export const PARTNER_TIER_LABELS: Record<PartnerTier, string> = {
  registered: "Registered",
  advanced: "Advanced",
  premier: "Premier",
};

export function tierRank(tier: PartnerTier): number {
  if (tier === "premier") return 3;
  if (tier === "advanced") return 2;
  return 1;
}

export function tierMeetsMinimum(current: PartnerTier, required: PartnerTier): boolean {
  return tierRank(current) >= tierRank(required);
}
