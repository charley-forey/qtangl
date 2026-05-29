/** Keep in sync with backend/contracts/*.schema.json */
import optimizeRequestSchema from "@/lib/docs/contracts/optimize-request.schema.json";
import optimizeResponseSchema from "@/lib/docs/contracts/optimize-response.schema.json";
import pqcScanRequestSchema from "@/lib/docs/contracts/pqc-scan-request.schema.json";
import pqcScanResponseSchema from "@/lib/docs/contracts/pqc-scan-response.schema.json";

export const optimizeRequestJsonSchema = optimizeRequestSchema;
export const optimizeResponseJsonSchema = optimizeResponseSchema;
export const pqcScanRequestJsonSchema = pqcScanRequestSchema;
export const pqcScanResponseJsonSchema = pqcScanResponseSchema;

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
] as const;
