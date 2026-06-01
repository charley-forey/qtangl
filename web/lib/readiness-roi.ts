export type ReadinessRoiInput = {
  inventoryHours: number;
  loadedHourlyRate: number;
  refreshPerYear: number;
  auditCyclesPerYear: number;
  auditHoursPerCycle: number;
  consultingBaseline: number;
  consultingAmortizeYears: number;
  monitorAnnualCost: number;
  oversightHoursPerYear: number;
};

export type ReadinessRoiResult = {
  statusQuoAnnual: number;
  qtanglAnnual: number;
  grossSavings: number;
  statusQuoBreakdown: {
    manualInventory: number;
    auditPrep: number;
    consultingAmortized: number;
  };
  qtanglBreakdown: {
    monitor: number;
    oversight: number;
  };
  narrative: string;
};

const DEFAULT_INPUT: ReadinessRoiInput = {
  inventoryHours: 200,
  loadedHourlyRate: 120,
  refreshPerYear: 4,
  auditCyclesPerYear: 2,
  auditHoursPerCycle: 40,
  consultingBaseline: 150_000,
  consultingAmortizeYears: 3,
  monitorAnnualCost: 100_000,
  oversightHoursPerYear: 80,
};

export function defaultReadinessRoiInput(): ReadinessRoiInput {
  return { ...DEFAULT_INPUT };
}

export function calculateReadinessRoi(input: ReadinessRoiInput): ReadinessRoiResult {
  const manualInventory = input.inventoryHours * input.loadedHourlyRate * input.refreshPerYear;
  const auditPrep =
    input.auditHoursPerCycle * input.loadedHourlyRate * input.auditCyclesPerYear;
  const consultingAmortized =
    input.consultingAmortizeYears > 0
      ? input.consultingBaseline / input.consultingAmortizeYears
      : 0;
  const statusQuoAnnual = manualInventory + auditPrep + consultingAmortized;

  const oversight = input.oversightHoursPerYear * input.loadedHourlyRate;
  const qtanglAnnual = input.monitorAnnualCost + oversight;
  const grossSavings = statusQuoAnnual - qtanglAnnual;

  const narrative =
    grossSavings > 0
      ? `Comparable or lower cost than status-quo manual inventory — plus continuous drift coverage and signed evidence each audit cycle.`
      : `Qtangl may cost more on paper — but adds continuous monitoring, drift alerts, and reusable signed evidence not in the status quo.`;

  return {
    statusQuoAnnual,
    qtanglAnnual,
    grossSavings,
    statusQuoBreakdown: {
      manualInventory,
      auditPrep,
      consultingAmortized,
    },
    qtanglBreakdown: {
      monitor: input.monitorAnnualCost,
      oversight,
    },
    narrative,
  };
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
