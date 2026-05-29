export type PqcRoiInput = {
  quantumVulnerableAssets: number;
  migrationBudgetMillions?: number;
  contractRiskMillions?: number;
};

export type PqcRoiResult = {
  headline: string;
  hndlRiskLabel: string;
  estimatedExposureMillions: number;
  migrationBudgetMillions: number;
};

export function calculatePqcRoi(input: PqcRoiInput): PqcRoiResult {
  const vuln = Math.max(0, input.quantumVulnerableAssets);
  const exposure = input.contractRiskMillions ?? Math.min(25, 2 + vuln * 0.35);
  const budget = input.migrationBudgetMillions ?? Math.min(25, 5 + vuln * 0.2);
  return {
    headline: `$${exposure.toFixed(1)}M contract / breach exposure vs $${budget.toFixed(1)}M migration budget`,
    hndlRiskLabel:
      vuln > 20
        ? "Elevated harvest-now-decrypt-later exposure"
        : "Moderate HNDL exposure under Mosca X+Y>Z",
    estimatedExposureMillions: exposure,
    migrationBudgetMillions: budget,
  };
}
