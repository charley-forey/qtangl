import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { CompliancePack, ComplianceSummary } from "@/lib/pqc";

const DEFAULT_FRAMEWORKS = ["NIST PQC", "CMMC", "HIPAA"];

export default function ComplianceFrameworkRail({
  compliance,
  scanId,
}: {
  compliance: { pack?: CompliancePack; summary?: ComplianceSummary } | null;
  scanId?: string | null;
}) {
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

  const mapped = Boolean(compliance?.pack || compliance?.summary);

  return (
    <Card tone="panel">
      <Eyebrow>Compliance frameworks</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-2">
        {DEFAULT_FRAMEWORKS.map((name) => (
          <StatusPill
            key={name}
            label={name}
            tone={mapped ? "success" : "warning"}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--color-gray-500)]">
        Open scan {scanId} reports for full control mapping.
      </p>
    </Card>
  );
}
