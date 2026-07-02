export const monitorDriftSummaryRequest = {
  method: "GET",
  path: "/tenant/drift/summary?since_days=7",
  headers: { Authorization: "Bearer qtangl_live_..." },
};

export const monitorDriftSummaryResponse = {
  status: "success",
  sinceDays: 7,
  scopeCount: 4,
  totalAdded: 17,
  totalRemoved: 4,
  bySource: {
    external: { scopes: 2, added: 8, removed: 2 },
    host: { scopes: 1, added: 3, removed: 0 },
    code: { scopes: 1, added: 4, removed: 1 },
    cbom: { scopes: 1, added: 2, removed: 1 },
  },
  snapshotCount: 45,
};

export const monitorScheduleRequest = {
  method: "POST",
  path: "/tenant/schedules",
  body: {
    target: "api.example.com",
    cadenceHours: 168,
    notifyEmail: "ciso@example.com",
    scenarioId: "bank-tls-portfolio",
  },
};

export const monitorScheduleResponse = {
  id: "sched_abc123",
  tenantId: "tenant-acme",
  target: "api.example.com",
  cadenceHours: 168,
  nextRunAt: "2026-04-17T09:00:00Z",
  active: true,
  jobType: "scan",
};
