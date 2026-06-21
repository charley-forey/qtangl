import assert from "node:assert/strict";
import test from "node:test";

/** Mirrors lib/dashboard-legal.ts for CI without TS import. */
function isLegalAcceptanceCurrent(tenantSettings) {
  const billing = tenantSettings?.billing ?? {};
  const termsRequired = String(tenantSettings?.termsVersionRequired ?? "2026-06-08");
  return Boolean(billing.termsAcceptedAt && billing.termsVersion === termsRequired);
}

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
