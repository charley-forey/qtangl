"use client";

type ProductionModeBannerProps = {
  tenantId?: string | null;
};

export default function ProductionModeBanner({ tenantId }: ProductionModeBannerProps) {
  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100"
    >
      <p className="font-medium text-white">Authorized production baseline</p>
      <p className="mt-1 text-emerald-100/90">
        Scans run under your tenant key and appear in your dashboard history.
        {tenantId ? (
          <>
            {" "}
            Tenant: <span className="font-mono text-white">{tenantId}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
