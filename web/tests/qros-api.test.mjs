import assert from "node:assert/strict";
import test from "node:test";
import { uninstallMarketplaceTile } from "../lib/qros-api.ts";

test("tile uninstall accepts 204 and rejects failed responses", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(url, "/api/dashboard/tenant/qros/marketplace/tiles/tile-1/install");
    assert.equal(init.method, "DELETE");
    assert.equal(init.credentials, "include");
    return new Response(null, { status: 204 });
  });
  await uninstallMarketplaceTile("tile-1");
  fetchMock.mock.mockImplementation(async () => new Response(JSON.stringify({ detail: "Denied" }), { status: 403 }));
  await assert.rejects(uninstallMarketplaceTile("tile-1"), /Denied/);
});
