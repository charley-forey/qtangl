"use client";

import { useState } from "react";

import ExecutiveDigestCard from "@/components/dashboard/ExecutiveDigestCard";
import ForecastCard from "@/components/dashboard/ForecastCard";
import MonitorBoardPackPreview from "@/components/marketing/MonitorBoardPackPreview";
import MonitorPeerBenchmarkPreview from "@/components/marketing/MonitorPeerBenchmarkPreview";
import MonitorPortfolioPreview from "@/components/marketing/MonitorPortfolioPreview";
import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";
import ScanDiffPanel from "@/components/pqc/ScanDiffPanel";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { frameworkGuideList } from "@/lib/copy/readiness-frameworks";
import { trackEvent } from "@/lib/analytics";

type Persona = "ciso" | "engineer" | "grc" | "mssp";

const TABS: { id: Persona; label: string }[] = [
  { id: "ciso", label: "CISO / Executive" },
  { id: "engineer", label: "Security engineer" },
  { id: "grc", label: "GRC / Auditor" },
  { id: "mssp", label: "MSSP / Partner" },
];

export default function MonitorPersonaTabs() {
  const [persona, setPersona] = useState<Persona>("ciso");
  const { scenario, weekIndex } = useMonitorScenario();
  const diff = scenario.weeks[weekIndex]?.diff;

  function selectTab(id: Persona) {
    setPersona(id);
    trackEvent("monitor_persona_tab", { persona: id });
  }

  return (
    <div id="personas" className="scroll-mt-28 space-y-6">
      <div className="content-reading">
        <Eyebrow>Personas</Eyebrow>
        <h2 className="heading-section mt-4">Built for how your team works</h2>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={persona === tab.id}
            onClick={() => selectTab(tab.id)}
            className={[
              "rounded-full border px-4 py-2 text-xs font-medium transition",
              persona === tab.id
                ? "border-white/30 bg-white/10 text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {persona === "ciso" ? (
        <div className="space-y-6">
          <MonitorBoardPackPreview />
          <div className="grid gap-6 lg:grid-cols-2">
            <ForecastCard forecast={scenario.forecast} />
            <MonitorPeerBenchmarkPreview />
          </div>
        </div>
      ) : null}

      {persona === "engineer" ? (
        <div className="space-y-6">
          <Card tone="panel" className="rounded-[var(--radius-xl)]">
            <Eyebrow>Latest drift diff</Eyebrow>
            <div className="mt-4">
              <ScanDiffPanel diff={diff} />
            </div>
          </Card>
          <Card tone="panel" className="rounded-[var(--radius-xl)]">
            <Eyebrow>Alert routing</Eyebrow>
            <p className="mt-3 text-sm text-[var(--color-gray-300)]">
              Configure Slack, Teams, and qtangl-webhook-v2 in dashboard settings. SIEM field map
              matches <code className="text-white">scanDiff.*</code> and{" "}
              <code className="text-white">alerts[]</code> in webhook payloads.
            </p>
            <p className="mt-4">
              <a href="/docs/integrations/siem-webhook-v2" className="text-sm text-sky-400 underline">
                Webhook v2 docs →
              </a>
            </p>
          </Card>
        </div>
      ) : null}

      {persona === "grc" ? (
        <div className="space-y-6">
          <Card tone="panel" className="rounded-[var(--radius-xl)]">
            <Eyebrow>Framework deadline roadmap</Eyebrow>
            <ul className="mt-4 space-y-2 text-xs">
              {frameworkGuideList.slice(0, 6).map((fw) => (
                <li
                  key={fw.slug}
                  className="flex items-start justify-between gap-2 rounded border border-[var(--border-subtle)] px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-white">{fw.title}</p>
                    <p className="text-[var(--color-gray-500)]">{fw.whyItMatters}</p>
                  </div>
                  <span className="shrink-0 text-[var(--color-gray-400)]">{fw.deadline}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[var(--color-gray-500)]">
              Current readiness {scenario.readinessScore} — prioritize findings mapped to nearest
              deadline. Verification confirms report integrity — not complete estate coverage.
            </p>
          </Card>
          <ExecutiveDigestCard digest={scenario.digest} />
        </div>
      ) : null}

      {persona === "mssp" ? <MonitorPortfolioPreview /> : null}
    </div>
  );
}
