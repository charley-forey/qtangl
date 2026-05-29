export function estimateAnnualSavings(dailySavings: number, fleetSize: number) {
  const workingDays = 260;
  const base = dailySavings * workingDays;
  const scale = Math.max(1, fleetSize / 18);
  return Math.round(base * scale);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
