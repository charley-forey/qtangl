export type AirlineRoiInput = {
  cancellationsPerMonth: number;
  passengersPerCancellation: number;
  costPerPassenger: number;
  recoveryRunsPerMonth: number;
};

export type AirlineRoiEstimate = {
  monthlySavings: number;
  annualSavings: number;
  avoidedCancellations: number;
  summary: string;
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function estimateAirlineRoi(input: AirlineRoiInput): AirlineRoiEstimate {
  const avoidedRate = 0.18;
  const avoidedCancellations = Math.round(input.cancellationsPerMonth * avoidedRate);
  const monthlySavings =
    avoidedCancellations * input.passengersPerCancellation * input.costPerPassenger;
  const annualSavings = monthlySavings * 12;

  return {
    monthlySavings,
    annualSavings,
    avoidedCancellations,
    summary: `Avoiding ~${avoidedCancellations} controllable cancellations/month at ${formatCurrency(input.costPerPassenger)} per pax.`,
  };
}
