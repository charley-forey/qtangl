import assert from "node:assert/strict";
import test from "node:test";

function buildBffUpstreamAuthHeaders(options) {
  const headers = {};
  if (options.assertion) {
    headers["X-Qtangl-Session"] = options.assertion;
  }
  if (options.sessionKey) {
    headers.Authorization = `Bearer ${options.sessionKey}`;
  }
  return headers;
}

function bffAuthForwardMode(assertion, sessionKey) {
  const hasAssertion = Boolean(assertion);
  const hasSessionKey = Boolean(sessionKey);
  if (hasAssertion && hasSessionKey) return "both";
  if (hasAssertion) return "assertion";
  if (hasSessionKey) return "sessionKey";
  return null;
}

test("buildBffUpstreamAuthHeaders sends both credentials when present", () => {
  const headers = buildBffUpstreamAuthHeaders({
    assertion: "assertion-token",
    sessionKey: "session-key-token",
  });
  assert.equal(headers["X-Qtangl-Session"], "assertion-token");
  assert.equal(headers.Authorization, "Bearer session-key-token");
  assert.equal(bffAuthForwardMode("assertion-token", "session-key-token"), "both");
});

test("buildBffUpstreamAuthHeaders sends single credential when only one present", () => {
  const assertionOnly = buildBffUpstreamAuthHeaders({ assertion: "a" });
  assert.equal(assertionOnly["X-Qtangl-Session"], "a");
  assert.equal(assertionOnly.Authorization, undefined);

  const keyOnly = buildBffUpstreamAuthHeaders({ sessionKey: "k" });
  assert.equal(keyOnly.Authorization, "Bearer k");
  assert.equal(keyOnly["X-Qtangl-Session"], undefined);
});
