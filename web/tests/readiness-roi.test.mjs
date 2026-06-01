import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateReadinessRoi,
  defaultReadinessRoiInput,
  formatUsd,
} from "../lib/readiness-roi.ts";

test("defaultReadinessRoiInput returns expected baseline", () => {
  const input = defaultReadinessRoiInput();
  assert.equal(input.inventoryHours, 200);
  assert.equal(input.monitorAnnualCost, 100_000);
});

test("calculateReadinessRoi computes status quo and savings", () => {
  const input = defaultReadinessRoiInput();
  const result = calculateReadinessRoi(input);

  assert.equal(result.statusQuoBreakdown.manualInventory, 200 * 120 * 4);
  assert.equal(result.statusQuoBreakdown.auditPrep, 40 * 120 * 2);
  assert.equal(result.statusQuoBreakdown.consultingAmortized, 50_000);
  assert.equal(result.qtanglBreakdown.monitor, 100_000);
  assert.equal(result.qtanglBreakdown.oversight, 80 * 120);
  assert.equal(
    result.statusQuoAnnual,
    result.statusQuoBreakdown.manualInventory +
      result.statusQuoBreakdown.auditPrep +
      result.statusQuoBreakdown.consultingAmortized,
  );
  assert.equal(
    result.qtanglAnnual,
    result.qtanglBreakdown.monitor + result.qtanglBreakdown.oversight,
  );
  assert.equal(result.grossSavings, result.statusQuoAnnual - result.qtanglAnnual);
  assert.match(result.narrative, /status-quo|Qtangl may cost more/);
});

test("formatUsd renders whole dollars", () => {
  assert.equal(formatUsd(1234567), "$1,234,567");
});
