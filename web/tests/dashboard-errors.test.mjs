import assert from "node:assert/strict";
import test from "node:test";

/** Mirrors dashboard-errors.ts QtanglApiError unwrapping for CI without TS import. */
function unwrapApiDetail(detail) {
  if (typeof detail === "object" && detail !== null && typeof detail.code === "string") {
    return detail;
  }
  if (typeof detail === "object" && detail !== null && "detail" in detail) {
    const nested = detail.detail;
    if (typeof nested === "object" && nested !== null && typeof nested.code === "string") {
      return nested;
    }
  }
  return null;
}

test("unwrapApiDetail reads FastAPI structured 402 payloads", () => {
  const parsed = unwrapApiDetail({
    detail: {
      code: "assess_payment_required",
      upgradeUrl: "/dashboard?upgrade=assess",
    },
  });
  assert.equal(parsed?.code, "assess_payment_required");
});
