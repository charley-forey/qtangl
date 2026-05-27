/** Keep in sync with backend/contracts/*.schema.json */
import optimizeRequestSchema from "@/lib/docs/contracts/optimize-request.schema.json";
import optimizeResponseSchema from "@/lib/docs/contracts/optimize-response.schema.json";

export const optimizeRequestJsonSchema = optimizeRequestSchema;
export const optimizeResponseJsonSchema = optimizeResponseSchema;

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
] as const;
