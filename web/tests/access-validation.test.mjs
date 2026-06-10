import assert from "node:assert/strict";
import test from "node:test";

import {
  isDeliveryConfigured,
  isHoneypotTripped,
  isSubmittedTooFast,
  parseAccessForm,
  resolveNotifyRecipients,
  validateAccessForm,
} from "../lib/access/validation.ts";

test("validateAccessForm requires email and interest", () => {
  const result = validateAccessForm({ email: "", interest: "" });
  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.email, "Enter a work email.");
  assert.equal(result.fieldErrors.interest, "Select an interest area.");
});

test("validateAccessForm rejects invalid email", () => {
  const result = validateAccessForm({
    email: "not-an-email",
    interest: "Q-Day Assessment (one-time)",
  });
  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.email, "Enter a valid work email.");
});

test("validateAccessForm accepts minimal valid payload", () => {
  const result = validateAccessForm({
    email: "ada@company.com",
    interest: "Optimization pilot",
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.fieldErrors, {});
});

test("parseAccessForm trims optional fields", () => {
  const formData = new FormData();
  formData.set("email", " ada@company.com ");
  formData.set("interest", "Q-Day Monitor (annual)");
  formData.set("name", " Ada ");
  formData.set("company", " Example ");
  formData.set("source", "demo");

  const payload = parseAccessForm(formData);
  assert.equal(payload.email, "ada@company.com");
  assert.equal(payload.interest, "Q-Day Monitor (annual)");
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

test("resolveNotifyRecipients always includes the founder inbox", () => {
  assert.deepEqual(resolveNotifyRecipients("charley@qtangl.com", ""), [
    "charley@qtangl.com",
  ]);
  assert.deepEqual(resolveNotifyRecipients("charley@qtangl.com", undefined), [
    "charley@qtangl.com",
  ]);
});

test("resolveNotifyRecipients appends and de-dupes configured recipients", () => {
  assert.deepEqual(
    resolveNotifyRecipients("charley@qtangl.com", "sales@qtangl.com, ops@qtangl.com"),
    ["charley@qtangl.com", "sales@qtangl.com", "ops@qtangl.com"]
  );

  // Founder inbox is not duplicated even if also listed (case-insensitive).
  assert.deepEqual(
    resolveNotifyRecipients("charley@qtangl.com", "Charley@qtangl.com, sales@qtangl.com"),
    ["charley@qtangl.com", "sales@qtangl.com"]
  );
});

test("isDeliveryConfigured is true whenever Resend or Formspree is set", () => {
  const previous = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    QTANGL_ACCESS_TO_EMAIL: process.env.QTANGL_ACCESS_TO_EMAIL,
    FORMSPREE_ENDPOINT: process.env.FORMSPREE_ENDPOINT,
  };

  try {
    delete process.env.RESEND_API_KEY;
    delete process.env.QTANGL_ACCESS_TO_EMAIL;
    delete process.env.FORMSPREE_ENDPOINT;
    assert.equal(isDeliveryConfigured(), false);

    // Resend key alone is enough — QTANGL_ACCESS_TO_EMAIL is optional now.
    process.env.RESEND_API_KEY = "re_test";
    assert.equal(isDeliveryConfigured(), true);

    delete process.env.RESEND_API_KEY;
    process.env.FORMSPREE_ENDPOINT = "https://formspree.io/f/test";
    assert.equal(isDeliveryConfigured(), true);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});
