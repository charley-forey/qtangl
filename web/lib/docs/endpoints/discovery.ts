import type { DocsEndpoint } from "@/lib/docs/types";
import { defineEndpoint, ROLE_ANY, ROLE_WRITE } from "@/lib/docs/endpoint-factory";

export const discoveryEndpoints: Record<string, DocsEndpoint> = {
  "discovery-fleets-list": defineEndpoint("discovery-fleets-list", {
    method: "GET",
    path: "/tenant/discovery/fleets",
    status: "ga",
    summary: "List discovery fleets for the tenant.",
    auth: true,
    role: ROLE_ANY,
    responseFields: [
      { name: "status", type: '"success"', required: true, description: "Request completed." },
      { name: "fleets", type: "object[]", required: true, description: "Fleet summaries with token metadata." },
    ],
    examples: [{ label: "Fleets", response: { status: "success", fleets: [{ fleetId: "fleet-abc", name: "Prod" }] } }],
  }),
  "discovery-fleets-create": defineEndpoint("discovery-fleets-create", {
    method: "POST",
    path: "/tenant/discovery/fleets",
    status: "ga",
    summary: "Create a fleet and return a one-time enrollment token.",
    auth: true,
    role: ROLE_WRITE,
    requestFields: [{ name: "name", type: "string", required: false, description: "Fleet display name." }],
    responseFields: [
      { name: "fleetId", type: "string", required: true, description: "New fleet id." },
      { name: "enrollmentToken", type: "string", required: true, description: "72h enrollment token." },
      { name: "expiresAt", type: "string", required: true, description: "ISO-8601 expiry." },
    ],
    examples: [
      {
        label: "Create fleet",
        request: { name: "Production" },
        response: { status: "success", fleetId: "fleet-abc", enrollmentToken: "tok_...", expiresAt: "2026-06-12T00:00:00Z" },
      },
    ],
  }),
  "discovery-agents": defineEndpoint("discovery-agents", {
    method: "GET",
    path: "/tenant/discovery/agents",
    status: "ga",
    summary: "List enrolled host agents with heartbeat and findings counts.",
    auth: true,
    role: ROLE_ANY,
    queryParams: [{ name: "fleetId", type: "string", required: false, description: "Filter by fleet." }],
    responseFields: [
      { name: "agents", type: "object[]", required: true, description: "Agent rows with status and lastSeenAt." },
    ],
    examples: [{ label: "Agents", response: { status: "success", agents: [{ agentId: "agent-1", status: "online" }] } }],
  }),
  "discovery-agent-findings": defineEndpoint("discovery-agent-findings", {
    method: "GET",
    path: "/tenant/discovery/agents/{agent_id}/findings",
    status: "ga",
    summary: "List host sensor findings for an enrolled agent.",
    auth: true,
    role: ROLE_ANY,
    queryParams: [
      { name: "limit", type: "integer", required: false, default: "50", description: "Page size (max 200)." },
      { name: "offset", type: "integer", required: false, default: "0", description: "Pagination offset." },
    ],
    responseFields: [
      { name: "findings", type: "object[]", required: true, description: "Finding summaries with algorithm and location." },
      { name: "total", type: "integer", required: true, description: "Total findings for agent." },
    ],
    examples: [
      {
        label: "Agent findings",
        response: {
          status: "success",
          agentId: "agent-1",
          findings: [{ findingId: "hf-001", algorithm: "RSA-2048", location: "/etc/ssl/cert.pem" }],
          total: 1,
        },
      },
    ],
  }),
  "discovery-finding-detail": defineEndpoint("discovery-finding-detail", {
    method: "GET",
    path: "/tenant/discovery/findings/{finding_id}",
    status: "ga",
    summary: "Get a single host finding with optional linked program item id.",
    auth: true,
    role: ROLE_ANY,
    responseFields: [
      { name: "finding", type: "object", required: true, description: "Parsed finding payload." },
      { name: "programItemId", type: "string", required: false, description: "Remediation program item when synced." },
    ],
    examples: [
      {
        label: "Finding detail",
        response: {
          status: "success",
          finding: { findingId: "hf-001", algorithm: "RSA-2048" },
          programItemId: "prog-abc",
        },
      },
    ],
  }),
  "discovery-code-scan": defineEndpoint("discovery-code-scan", {
    method: "POST",
    path: "/tenant/coverage/code-scan",
    status: "ga",
    summary: "Enqueue or run a code scan (CryptoScan + CryptoDeps).",
    auth: true,
    role: ROLE_ANY,
    requestFields: [
      { name: "githubOwner", type: "string", required: false, description: "Repository owner." },
      { name: "githubRepo", type: "string", required: false, description: "Repository name." },
      { name: "async", type: "boolean", required: false, default: "true", description: "Return job id when true." },
    ],
    responseFields: [
      { name: "jobId", type: "string", required: false, description: "Async job id." },
      { name: "findings", type: "object[]", required: false, description: "Sync scan findings." },
    ],
    examples: [{ label: "Async scan", request: { githubOwner: "org", githubRepo: "app", async: true }, response: { status: "success", jobId: "job-1", async: true } }],
  }),
  "discovery-binary-scan": defineEndpoint("discovery-binary-scan", {
    method: "POST",
    path: "/tenant/discovery/binary-scan",
    status: "ga",
    summary: "Enqueue a container/binary CBOM scan.",
    auth: true,
    role: ROLE_WRITE,
    requestFields: [
      { name: "imageRef", type: "string", required: true, description: "OCI image reference." },
      { name: "integrationId", type: "string", required: false, description: "Registry credential integration." },
    ],
    responseFields: [{ name: "jobId", type: "string", required: true, description: "Discovery job id." }],
    examples: [{ label: "Binary scan", request: { imageRef: "registry/app:1.0" }, response: { status: "success", jobId: "job-2" } }],
  }),
  "discovery-jobs": defineEndpoint("discovery-jobs", {
    method: "GET",
    path: "/tenant/discovery/jobs/{job_id}",
    status: "ga",
    summary: "Poll discovery job status and results.",
    auth: true,
    role: ROLE_ANY,
    responseFields: [
      { name: "jobId", type: "string", required: true, description: "Job id." },
      { name: "status", type: "string", required: true, description: "queued | running | done | failed." },
      { name: "result", type: "object", required: false, description: "Scan output when done." },
    ],
    examples: [{ label: "Job status", response: { status: "success", jobId: "job-1", jobStatus: "done", result: { findingsCount: 12 } } }],
  }),
  "discovery-cmdb-coverage": defineEndpoint("discovery-cmdb-coverage", {
    method: "GET",
    path: "/tenant/discovery/cmdb-coverage",
    status: "ga",
    summary: "Return CMDB host coverage percentage vs enrolled agents.",
    auth: true,
    role: ROLE_ANY,
    responseFields: [
      { name: "cmdbHostCount", type: "integer", required: true, description: "Hosts in CMDB." },
      { name: "coveredCount", type: "integer", required: true, description: "CMDB hosts with matching sensor." },
      { name: "coveragePercent", type: "number", required: true, description: "covered / cmdb * 100." },
    ],
    examples: [{ label: "Coverage", response: { status: "success", cmdbHostCount: 1000, coveredCount: 850, coveragePercent: 85.0 } }],
  }),
  "discovery-registry-test": defineEndpoint("discovery-registry-test", {
    method: "POST",
    path: "/tenant/discovery/registry/test-connection",
    status: "ga",
    summary: "Verify registry credentials can pull the given image reference.",
    auth: true,
    role: ROLE_WRITE,
    requestFields: [
      { name: "integrationId", type: "string", required: true, description: "Registry integration id." },
      { name: "imageRef", type: "string", required: true, description: "Image to test pull." },
    ],
    responseFields: [
      { name: "ok", type: "boolean", required: true, description: "Pull succeeded." },
      { name: "message", type: "string", required: false, description: "Error detail when ok is false." },
    ],
    examples: [{ label: "Test pull", request: { integrationId: "int_ecr", imageRef: "123.dkr.ecr.us-east-1.amazonaws.com/app:latest" }, response: { status: "success", ok: true } }],
  }),
};
