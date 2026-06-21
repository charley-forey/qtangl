import assert from "node:assert/strict";
import test from "node:test";

import { QtanglClient, QtanglApiError, newIdempotencyKey } from "../dist/index.js";

test("newIdempotencyKey returns uuid", () => {
  const key = newIdempotencyKey();
  assert.match(key, /^[0-9a-f-]{36}$/);
});

test("client scanFixture uses transport", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ status: "success", scanId: "scan-1" }), {
      status: 200,
      headers: { "content-type": "application/json", "X-Request-Id": "req-1" },
    });
  };

  const client = new QtanglClient({
    baseUrl: "https://api.example.com",
    apiKey: "demo-key",
    fetchImpl,
  });

  const payload = await client.scanFixture({ idempotencyKey: "idem-1" });
  assert.equal(payload.scanId, "scan-1");
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/pqc\/scan$/);
  assert.equal(calls[0].init.headers["Idempotency-Key"], "idem-1");
  assert.equal(calls[0].init.headers.Authorization, "Bearer demo-key");
});

test("verifyScan is public", async () => {
  const fetchImpl = async () =>
    new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  const client = new QtanglClient({
    baseUrl: "https://api.example.com",
    apiKey: "demo-key",
    fetchImpl,
  });

  const payload = await client.verifyScan("scan-1");
  assert.equal(payload.valid, true);
});

test("monitor settings helper uses transport", async () => {
  const fetchImpl = async (_url, init) => {
    assert.equal(init.method, "GET");
    return new Response(JSON.stringify({ status: "success", settings: {} }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const client = new QtanglClient({
    baseUrl: "https://api.example.com",
    apiKey: "demo-key",
    fetchImpl,
  });

  const payload = await client.monitor.getSettings();
  assert.equal(payload.status, "success");
});

test("transport throws QtanglApiError", async () => {
  const fetchImpl = async () =>
    new Response(JSON.stringify({ detail: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json", "X-Request-Id": "req-401" },
    });

  const client = new QtanglClient({
    baseUrl: "https://api.example.com",
    apiKey: "bad",
    fetchImpl,
    maxRetries: 0,
  });

  await assert.rejects(
    () => client.listScans(),
    (error) => {
      assert.ok(error instanceof QtanglApiError);
      assert.equal(error.status, 401);
      assert.equal(error.requestId, "req-401");
      return true;
    }
  );
});

test("transport surfaces structured 402 payment detail", async () => {
  const fetchImpl = async () =>
    new Response(
      JSON.stringify({
        detail: {
          code: "assess_payment_required",
          upgradeUrl: "/dashboard?upgrade=assess",
        },
      }),
      {
        status: 402,
        headers: { "content-type": "application/json", "X-Request-Id": "req-402" },
      }
    );

  const client = new QtanglClient({
    baseUrl: "https://api.example.com",
    apiKey: "demo-key",
    fetchImpl,
    maxRetries: 0,
  });

  await assert.rejects(
    () => client.scan({ scenarioId: "bank-tls-inventory", useFixture: false }),
    (error) => {
      assert.ok(error instanceof QtanglApiError);
      assert.equal(error.status, 402);
      assert.match(error.message, /assess_payment_required/);
      return true;
    }
  );
});
