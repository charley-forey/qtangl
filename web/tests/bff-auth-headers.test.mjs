import assert from "node:assert/strict";
import test from "node:test";

import { buildBffUpstreamAuthHeaders, bffAuthForwardMode } from "../lib/auth/bff-auth-headers.ts";

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
