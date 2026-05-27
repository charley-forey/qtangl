export type OptimizeResponse = {
  status?: string;
  summary?: string;
  solution?: unknown;
  metrics?: Record<string, string | number>;
  method?: string;
  details?: Record<string, unknown>;
};

export type SandboxLiveStatus = "preview" | "live" | "fallback";
