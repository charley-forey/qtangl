# @qtangl/sdk (TypeScript)

Official TypeScript client for the Qtangl PQC Readiness API.

## Install

```bash
npm install @qtangl/sdk
```

Monorepo development:

```bash
cd sdk/typescript && npm install && npm run build
```

The Qtangl web app consumes this package via `file:../sdk/typescript`.

## Quickstart

```typescript
import { QtanglClient, newIdempotencyKey } from "@qtangl/sdk";

const client = new QtanglClient({
  baseUrl: "https://api.qtangl.com",
  apiKey: process.env.QTANGL_API_KEY!,
});

const scan = await client.scanFixture({ idempotencyKey: newIdempotencyKey() });
const verify = await client.verifyScan(String(scan.scanId));
console.log(verify.verification);

const me = await client.me();
```

Offline cryptographic verify is provided by the `qtangl-verify` Python CLI. The TypeScript SDK wraps public HTTP verify endpoints.

## Generic requests

```typescript
await client.request({
  method: "PATCH",
  path: "/tenant/settings",
  body: { benchmarkOptIn: true },
});
```
