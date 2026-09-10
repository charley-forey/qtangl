import assert from "node:assert/strict";
import test from "node:test";

import { isLegalAcceptanceCurrent } from "../lib/dashboard-legal.ts";

test("isLegalAcceptanceCurrent returns true when terms match required version", () => {
  const settings = {
    termsVersionRequired: "2026-06-08",
    billing: {
      termsAcceptedAt: "2026-06-01T00:00:00Z",
      termsVersion: "2026-06-08",
    },
  };
  assert.equal(isLegalAcceptanceCurrent(settings), true);
});

test("isLegalAcceptanceCurrent returns false when terms version is stale", () => {
  const settings = {
    termsVersionRequired: "2026-06-08",
    billing: {
      termsAcceptedAt: "2026-06-01T00:00:00Z",
      termsVersion: "2025-01-01",
    },
  };
  assert.equal(isLegalAcceptanceCurrent(settings), false);
});

test("isLegalAcceptanceCurrent returns false when terms not accepted", () => {
  assert.equal(isLegalAcceptanceCurrent({ billing: {} }), false);
  assert.equal(isLegalAcceptanceCurrent(null), false);
});
