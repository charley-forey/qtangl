"use client";

import { useCallback, useEffect, useState } from "react";

import { getCmdbCoverage } from "@/lib/discovery";

type CmdbCoverageWidgetProps = {
  apiKey: string;
};

export default function CmdbCoverageWidget({ apiKey }: CmdbCoverageWidgetProps) {
  const [coverage, setCoverage] = useState<{
    coveragePercent: number;
    coveredCount: number;
    cmdbHostCount: number;
    enrolledAgentCount: number;
  } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getCmdbCoverage(apiKey);
      setCoverage({
        coveragePercent: Number(res.coveragePercent ?? 0),
        coveredCount: Number(res.coveredCount ?? 0),
        cmdbHostCount: Number(res.cmdbHostCount ?? 0),
        enrolledAgentCount: Number(res.enrolledAgentCount ?? 0),
      });
    } catch {
      setCoverage(null);
    }
  }, [apiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!coverage) {
    return (
      <p className="text-sm text-[var(--color-gray-400)]">
        CMDB coverage unavailable — configure ServiceNow env vars on the API.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-medium text-white">CMDB host coverage</p>
      <p className="mt-2 text-2xl font-semibold text-white">{coverage.coveragePercent.toFixed(1)}%</p>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        {coverage.coveredCount} of {coverage.cmdbHostCount} CMDB hosts have a matching sensor (
        {coverage.enrolledAgentCount} agents enrolled)
      </p>
    </div>
  );
}
