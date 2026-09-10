import assert from "node:assert/strict";
import test from "node:test";

import { AUTORUN_SCENARIO_IDS, isAssessResultTab, scenarioIndustry } from "../lib/assess-config.ts";

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
