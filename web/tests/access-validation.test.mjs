import assert from "node:assert/strict";
import test from "node:test";

import {
  isHoneypotTripped,
  isSubmittedTooFast,
  parseAccessForm,
  validateAccessForm,
} from "../lib/access/validation.ts";

test("validateAccessForm requires email and interest", () => {
  const result = validateAccessForm({ email: "", interest: "" });
  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.email, "Enter a work email.");
  assert.equal(result.fieldErrors.interest, "Select a planning workflow.");
});

test("validateAccessForm rejects invalid email", () => {
  const result = validateAccessForm({
    email: "not-an-email",
    interest: "Scheduling optimization",
  });
  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.email, "Enter a valid work email.");
});

test("validateAccessForm accepts minimal valid payload", () => {
  const result = validateAccessForm({
    email: "ada@company.com",
    interest: "Routing optimization",
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.fieldErrors, {});
});

test("parseAccessForm trims optional fields", () => {
  const formData = new FormData();
  formData.set("email", " ada@company.com ");
  formData.set("interest", "Developer platform");
  formData.set("name", " Ada ");
  formData.set("company", " Example ");
  formData.set("source", "demo");

  const payload = parseAccessForm(formData);
  assert.equal(payload.email, "ada@company.com");
  assert.equal(payload.interest, "Developer platform");
  assert.equal(payload.name, "Ada");
  assert.equal(payload.company, "Example");
  assert.equal(payload.source, "demo");
});

test("isHoneypotTripped detects bot submissions", () => {
  assert.equal(isHoneypotTripped({ website: "" }), false);
  assert.equal(isHoneypotTripped({ website: "https://spam.example" }), true);
});

test("isSubmittedTooFast flags instant submissions", () => {
  assert.equal(isSubmittedTooFast({ formStartedAt: Date.now() - 500 }), true);
  assert.equal(isSubmittedTooFast({ formStartedAt: Date.now() - 5000 }), false);
  assert.equal(isSubmittedTooFast({ formStartedAt: 0 }), false);
});
