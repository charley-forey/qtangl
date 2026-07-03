"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { ccFlags } from "@/lib/cc-feature-flags";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type CorrelatedIncident = {
  id: string;
  title: string;
  alertIds: string[];
  correlationKeys: string[];
  severity: string;
  summary: string;
  createdAt: string;
};

type IncidentsResponse = { incidents?: CorrelatedIncident[] };

const SEVERITY_TONE: Record<string, string> = {
  critical: "text-red-300",
  high: "text-orange-300",
  medium: "text-amber-200",
  low: "text-sky-300",
};

export default function CorrelatedIncidentsPanel() {
  const [incidents, setIncidents] = useState<CorrelatedIncident[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!ccFlags.correlation) return;
    void fetchDashboardJson<IncidentsResponse>("/tenant/incidents/correlated")
      .then((data) => setIncidents(data.incidents ?? []))
      .catch(() => setIncidents([]));
  }, []);

  if (!ccFlags.correlation || incidents.length === 0) return null;

  return (
    <Card tone="panel" className="space-y-3">
      <Eyebrow>Correlated incidents</Eyebrow>
      <p className="text-[10px] text-[var(--color-gray-500)]">
        Related alerts grouped by shared host, algorithm, or rule — reduces noise, not a severity judgement.
      </p>
      <ul className="space-y-2">
        {incidents.map((incident) => {
          const open = expanded === incident.id;
          return (
            <li key={incident.id} className="rounded-lg border border-[var(--border-subtle)]">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                onClick={() => {
                  setExpanded(open ? null : incident.id);
                  if (!open) {
                    trackDashboardEvent({ event: "cc_incident_expanded", properties: { incidentId: incident.id } });
                  }
                }}
                aria-expanded={open}
              >
                <span className="text-sm text-white">{incident.title}</span>
                <span className={`text-[10px] uppercase tracking-wide ${SEVERITY_TONE[incident.severity] ?? "text-[var(--color-gray-400)]"}`}>
                  {incident.severity} · {incident.alertIds.length} alerts
                </span>
              </button>
              {open ? (
                <div className="border-t border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--color-gray-400)]">
                  <p>{incident.summary}</p>
                  {incident.correlationKeys.length > 0 ? (
                    <p className="mt-2 flex flex-wrap gap-1">
                      {incident.correlationKeys.map((key) => (
                        <span key={key} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-sky-300">
                          {key}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
