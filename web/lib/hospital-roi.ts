export type RoiInputs = {
  bedCount: number;
  quarterlyAgencySpend: number;
  monthlyCallouts: number;
  averageSwapMinutes: number;
};

export type RoiEstimate = {
  annualSavingsLow: number;
  annualSavingsHigh: number;
  monthlyHoursRecovered: number;
  estimatedPaybackWeeks: number;
  summary: string;
};

const BASE_RATE = 0.11;
const UPPER_MULTIPLIER = 1.7;
const HOURS_PER_CALLOUT = 0.33;

export function estimateHospitalRoi(inputs: RoiInputs): RoiEstimate {
  const scaleFactor =
    Math.max(inputs.bedCount, 150) / 420 +
    Math.max(inputs.monthlyCallouts, 5) / 40 +
    Math.max(inputs.averageSwapMinutes, 10) / 60;

  const annualizedAgencySpend = inputs.quarterlyAgencySpend * 4;
  const annualSavingsLow = annualizedAgencySpend * BASE_RATE * (scaleFactor / 3);
  const annualSavingsHigh = annualSavingsLow * UPPER_MULTIPLIER;
  const monthlyHoursRecovered = inputs.monthlyCallouts * HOURS_PER_CALLOUT * inputs.averageSwapMinutes;
  const estimatedPaybackWeeks = Math.max(
    4,
    Math.round((52000 / Math.max(annualSavingsLow, 1)) * 52)
  );

  return {
    annualSavingsLow: Math.round(annualSavingsLow),
    annualSavingsHigh: Math.round(annualSavingsHigh),
    monthlyHoursRecovered: Math.round(monthlyHoursRecovered),
    estimatedPaybackWeeks,
    summary: `A ${inputs.bedCount}-bed hospital spending $${inputs.quarterlyAgencySpend.toLocaleString()} per quarter on agency labor could likely recover $${Math.round(
      annualSavingsLow
    ).toLocaleString()}-$${Math.round(annualSavingsHigh).toLocaleString()} annually.`,
  };
}
