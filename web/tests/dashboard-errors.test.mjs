import assert from "node:assert/strict";
import test from "node:test";

import { parseDashboardApiError } from "../lib/dashboard-errors.ts";

test("parseDashboardApiError reads FastAPI structured 402 payloads", () => {
  const parsed = parseDashboardApiError(new Error(JSON.stringify({
    detail: {
      code: "assess_payment_required",
      upgradeUrl: "/command-center?upgrade=assess",
    },
  })));
  assert.equal(parsed?.code, "assess_payment_required");
});
