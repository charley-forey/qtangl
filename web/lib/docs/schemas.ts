/** Keep in sync with backend/contracts/*.schema.json */
import optimizeRequestSchema from "@/lib/docs/contracts/optimize-request.schema.json";
import optimizeResponseSchema from "@/lib/docs/contracts/optimize-response.schema.json";
import pqcCbomIngestRequestSchema from "@/lib/docs/contracts/pqc-cbom-ingest-request.schema.json";
import pqcCbomIngestResponseSchema from "@/lib/docs/contracts/pqc-cbom-ingest-response.schema.json";
import pqcScanRequestSchema from "@/lib/docs/contracts/pqc-scan-request.schema.json";
import pqcScanResponseSchema from "@/lib/docs/contracts/pqc-scan-response.schema.json";
import pqcVerifyResponseSchema from "@/lib/docs/contracts/pqc-verify-response.schema.json";

export const optimizeRequestJsonSchema = optimizeRequestSchema;
export const optimizeResponseJsonSchema = optimizeResponseSchema;
export const pqcScanRequestJsonSchema = pqcScanRequestSchema;
export const pqcScanResponseJsonSchema = pqcScanResponseSchema;
export const pqcCbomIngestRequestJsonSchema = pqcCbomIngestRequestSchema;
export const pqcCbomIngestResponseJsonSchema = pqcCbomIngestResponseSchema;
export const pqcVerifyResponseJsonSchema = pqcVerifyResponseSchema;

export const schemaDocuments = [
  {
    id: "optimize-request",
    title: "Optimize request",
    schema: optimizeRequestSchema,
    href: "/docs/reference/schemas#optimize-request",
  },
  {
    id: "optimize-response",
    title: "Optimize response",
    schema: optimizeResponseSchema,
    href: "/docs/reference/schemas#optimize-response",
  },
  {
    id: "pqc-scan-request",
    title: "PQC scan request",
    schema: pqcScanRequestSchema,
    href: "/docs/reference/schemas#pqc-scan-request",
  },
  {
    id: "pqc-scan-response",
    title: "PQC scan response",
    schema: pqcScanResponseSchema,
    href: "/docs/reference/schemas#pqc-scan-response",
  },
  {
    id: "pqc-cbom-ingest-request",
    title: "CBOM ingest request",
    schema: pqcCbomIngestRequestSchema,
    href: "/docs/reference/schemas#pqc-cbom-ingest-request",
  },
  {
    id: "pqc-cbom-ingest-response",
    title: "CBOM ingest response",
    schema: pqcCbomIngestResponseSchema,
    href: "/docs/reference/schemas#pqc-cbom-ingest-response",
  },
  {
    id: "pqc-verify-response",
    title: "Verify response",
    schema: pqcVerifyResponseSchema,
    href: "/docs/reference/schemas#pqc-verify-response",
  },
] as const;
