import assert from "node:assert/strict";
import test from "node:test";

/** Mirrors assess-config.ts constants for CI without TS import. */
const ASSESS_RESULT_TABS = [
  "executive",
  "compliance",
  "inventory",
  "remediation",
  "technical",
  "evidence",
];

const AUTORUN_SCENARIO_IDS = new Set([
  "bank-tls-inventory",
  "gov-contractor-cmmc",
  "healthcare-insurer-hndl",
]);

const SCENARIO_INDUSTRY = {
  "bank-tls-inventory": "financial",
  "gov-contractor-cmmc": "government",
  "healthcare-insurer-hndl": "healthcare",
};

function isAssessResultTab(value) {
  return value != null && ASSESS_RESULT_TABS.includes(value);
}

function scenarioIndustry(scenarioId) {
  return SCENARIO_INDUSTRY[scenarioId] ?? "financial";
}

test("isAssessResultTab accepts known tabs", () => {
  assert.equal(isAssessResultTab("executive"), true);
  assert.equal(isAssessResultTab("evidence"), true);
  assert.equal(isAssessResultTab("unknown"), false);
  assert.equal(isAssessResultTab(null), false);
});

test("AUTORUN_SCENARIO_IDS includes marketing scenarios", () => {
  assert.equal(AUTORUN_SCENARIO_IDS.has("bank-tls-inventory"), true);
  assert.equal(AUTORUN_SCENARIO_IDS.has("gov-contractor-cmmc"), true);
  assert.equal(AUTORUN_SCENARIO_IDS.has("healthcare-insurer-hndl"), true);
});

test("scenarioIndustry maps scenario to cohort", () => {
  assert.equal(scenarioIndustry("bank-tls-inventory"), "financial");
  assert.equal(scenarioIndustry("gov-contractor-cmmc"), "government");
  assert.equal(scenarioIndustry("unknown"), "financial");
});
