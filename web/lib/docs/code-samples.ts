import { qtanglApiBaseUrl, qtanglSandboxApiKey } from "@/lib/api";

export function curlOptimize(body: object) {
  const json = JSON.stringify(body, null, 2);
  return `curl -X POST "${qtanglApiBaseUrl}/optimize" \\
  -H "Authorization: Bearer ${qtanglSandboxApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${json.replace(/'/g, "'\\''")}'`;
}

export function javascriptFetch(path: string, method: string, body?: object) {
  const bodyLine = body
    ? `  body: JSON.stringify(${JSON.stringify(body, null, 2).replace(/\n/g, "\n  ")}),\n`
    : "";
  return `const response = await fetch("${qtanglApiBaseUrl}${path}", {
  method: "${method}",
  headers: {
    Authorization: "Bearer ${qtanglSandboxApiKey}",
    "Content-Type": "application/json",
  },
${bodyLine}});

if (!response.ok) {
  throw new Error(await response.text());
}

const data = await response.json();`;
}

export function pythonRequests(path: string, method: string, body?: object) {
  const bodyArg = body ? `json=${JSON.stringify(body)},\n    ` : "";
  return `import requests

response = requests.${method.toLowerCase()}(
    "${qtanglApiBaseUrl}${path}",
    headers={
        "Authorization": "Bearer ${qtanglSandboxApiKey}",
        "Content-Type": "application/json",
    },
    ${bodyArg}timeout=60,
)
response.raise_for_status()
data = response.json()`;
}

export function typescriptFetch(path: string, method: string, body?: object) {
  const bodyType = body ? "OptimizeRequest" : "void";
  const bodyLine = body
    ? `    body: JSON.stringify(payload satisfies OptimizeRequest),\n`
    : "";
  return `type OptimizeRequest = ${JSON.stringify(body ?? {}, null, 2)};

const payload: OptimizeRequest = ${JSON.stringify(body ?? {}, null, 2)};

const response = await fetch("${qtanglApiBaseUrl}${path}", {
  method: "${method}",
  headers: {
    Authorization: "Bearer ${qtanglSandboxApiKey}",
    "Content-Type": "application/json",
  },
${bodyLine}});

if (!response.ok) {
  throw new Error(await response.text());
}

const data = (await response.json()) as ${bodyType === "void" ? "{ status: string }" : "OptimizeResponse"};`;
}

export function curlGet(path: string) {
  return `curl "${qtanglApiBaseUrl}${path}" \\
  -H "Authorization: Bearer ${qtanglSandboxApiKey}"`;
}

export function curlPost(path: string, body: object) {
  const json = JSON.stringify(body, null, 2);
  return `curl -X POST "${qtanglApiBaseUrl}${path}" \\
  -H "Authorization: Bearer ${qtanglSandboxApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${json.replace(/'/g, "'\\''")}'`;
}

export function curlPqcScan(body: object) {
  const json = JSON.stringify(body, null, 2);
  return `curl -X POST "${qtanglApiBaseUrl}/pqc/scan" \\
  -H "Authorization: Bearer ${qtanglSandboxApiKey}" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: scan-$(uuidgen)" \\
  -d '${json.replace(/'/g, "'\\''")}'`;
}

export function pollScanStatus(scanId: string) {
  return `curl "${qtanglApiBaseUrl}/pqc/scan/${scanId}" \\
  -H "Authorization: Bearer ${qtanglSandboxApiKey}"`;
}
