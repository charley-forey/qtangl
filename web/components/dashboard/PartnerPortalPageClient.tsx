"use client";

import { useEffect, useState } from "react";

import PartnerPortalClient from "@/components/dashboard/PartnerPortalClient";
import DashboardSkeleton from "@/components/dashboard/ui/DashboardSkeleton";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import type { PortfolioTabBundle } from "@/lib/dashboard-state";
import type { PartnerProgramInfo } from "@/lib/partner-tiers";

export default function PartnerPortalPageClient() {
  const [bundle, setBundle] = useState<PortfolioTabBundle | null>(null);
  const [program, setProgram] = useState<PartnerProgramInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [portfolioRes, programRes] = await Promise.all([
        fetchDashboardJson<{ data?: PortfolioTabBundle } & PortfolioTabBundle>(
          "/tenant/dashboard/tab/portfolio"
        ),
        fetchDashboardJson<PartnerProgramInfo & { status?: string }>("/tenant/partner/program"),
      ]);
      setBundle((portfolioRes.data ?? portfolioRes) as PortfolioTabBundle);
      setProgram({
        partnerTier: programRes.partnerTier,
        limits: programRes.limits,
        childrenCount: programRes.childrenCount,
        atChildLimit: programRes.atChildLimit,
      });
    } catch {
      setBundle(null);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return <PartnerPortalClient portfolioBundle={bundle} program={program} onRefresh={() => void load()} />;
}
