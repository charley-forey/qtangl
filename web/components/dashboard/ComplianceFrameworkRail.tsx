"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import type { CompliancePack, ComplianceSummary } from "@/lib/pqc";

const DEFAULT_FRAMEWORKS = ["NIST PQC", "CMMC", "HIPAA"];

type FrameworkStatus = { name: string; status: string; tone: "success" | "warning" | "critical" | "neutral" };

export default function ComplianceFrameworkRail({
  compliance,
  scanId,
  onOpenReport,
}: {
  compliance: { pack?: CompliancePack; summary?: ComplianceSummary } | null;
  scanId?: string | null;
  onOpenReport?: () => void;
}) {
  const [frameworks, setFrameworks] = useState<FrameworkStatus[] | null>(null);

  useEffect(() => {
    if (!scanId) return;
    let cancelled = false;
    async function load() {
      try {
        const payload = await fetchDashboardJson<{
          frameworks?: Array<{ name: string; status: string }>;
        }>(`/tenant/compliance/posture?scan_id=${encodeURIComponent(scanId ?? "")}`);
        if (cancelled) return;
        const rows = payload.frameworks ?? DEFAULT_FRAMEWORKS.map((name) => ({ name, status: "unknown" }));
        setFrameworks(
          rows.map((row) => ({
            name: row.name,
            status: row.status,
            tone:
              row.status === "pass" || row.status === "mapped"
                ? "success"
                : row.status === "gap" || row.status === "fail"
                  ? "critical"
                  : "warning",
          }))
        );
      } catch {
        if (!cancelled) {
          const mapped = Boolean(compliance?.pack || compliance?.summary);
          setFrameworks(
            DEFAULT_FRAMEWORKS.map((name) => ({
              name,
              status: mapped ? "mapped" : "pending",
              tone: mapped ? "success" : "warning",
            }))
          );
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [compliance?.pack, compliance?.summary, scanId]);

  if (!scanId) {
    return (
      <Card tone="ghost" className="border border-[var(--border-subtle)]">
        <Eyebrow>Compliance mapping</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          Run a baseline scan to map controls to NIST PQC, CMMC, and HIPAA frameworks.
        </p>
      </Card>
    );
  }

  return (
    <Card tone="panel">
      <Eyebrow>Compliance frameworks</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-2">
        {(frameworks ?? DEFAULT_FRAMEWORKS.map((name) => ({ name, status: "loading", tone: "neutral" as const }))).map(
          (row) => (
            <button key={row.name} type="button" onClick={onOpenReport} className="inline-flex">
              <StatusPill label={`${row.name}: ${row.status}`} tone={row.tone} />
            </button>
          )
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--color-gray-500)]">
        Click a framework pill to open the compliance section in reports.
      </p>
    </Card>
  );
}
