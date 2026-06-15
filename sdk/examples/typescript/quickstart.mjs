import { QtanglClient, newIdempotencyKey, VERSION } from "@qtangl/sdk";

const client = new QtanglClient({
  baseUrl: process.env.QTANGL_API_BASE ?? "https://api.qtangl.com",
  apiKey: process.env.QTANGL_API_KEY ?? "your-api-key",
});

console.log("sdk version", VERSION);

const scan = await client.scanFixture({ idempotencyKey: newIdempotencyKey() });
console.log("scanId", scan.scanId);

const verify = await client.verifyScan(String(scan.scanId));
console.log("valid", (verify.verification as { valid?: boolean } | undefined)?.valid);

const settings = await client.monitor.getSettings();
console.log("settings", settings.settings);
