"use client";

import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export default function PartnerQbrExportButton({ childTenantId }: { childTenantId?: string }) {
  async function exportPack(format: "pdf" | "csv") {
    trackDashboardEvent({
      event: "cc_partner_qbr_export",
      properties: { format, childTenantId: childTenantId ?? "portfolio" },
    });
    const path = childTenantId
      ? `/tenant/partner/usage-export?tenantId=${encodeURIComponent(childTenantId)}&format=${format}`
      : `/tenant/partner/usage-export?format=${format}`;
    window.open(`/api/dashboard${path}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-sky-300"
        onClick={() => void exportPack("pdf")}
      >
        QBR PDF
      </button>
      <button
        type="button"
        className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-sky-300"
        onClick={() => void exportPack("csv")}
      >
        Board pack CSV
      </button>
    </div>
  );
}
