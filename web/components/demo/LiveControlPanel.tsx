"use client";

import { useCallback, useEffect, useState } from "react";

import AlertFeed from "@/components/demo/AlertFeed";
import CampaignScrubber from "@/components/demo/CampaignScrubber";
import DemoHonestyBanner from "@/components/demo/DemoHonestyBanner";
import DirectorDeck from "@/components/demo/DirectorDeck";
import {
  applyDemoScene,
  createDemoResource,
  fetchDemoScenes,
  fetchDemoStatus,
  injectDemoEvent,
  patchDemoResource,
  reassessDemo,
  setDemoChaos,
  type DemoResource,
  type DemoScene,
  type DemoSnapshot,
  type DemoStatusResponse,
} from "@/lib/demo";

const POSTURES = ["classical", "hybrid", "pqc"] as const;
const COMPLIANCE = ["general", "nist-ir-8547", "pci-dss", "cmmc"] as const;

export default function LiveControlPanel() {
  const [status, setStatus] = useState<DemoStatusResponse | null>(null);
  const [scenes, setScenes] = useState<DemoScene[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    host: "",
    port: "443",
    kind: "tls",
    businessUnit: "Platform",
  });

  const refresh = useCallback(async () => {
    const [nextStatus, nextScenes] = await Promise.all([fetchDemoStatus(), fetchDemoScenes()]);
    setStatus(nextStatus);
    setScenes(nextScenes.scenes);
  }, []);

  useEffect(() => {
    void refresh().catch((err) => setError(err instanceof Error ? err.message : "Failed to load demo."));
  }, [refresh]);

  async function runMutation(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function updateResource(resource: DemoResource, patch: Partial<DemoResource>) {
    await runMutation(() => patchDemoResource(resource.id, patch));
  }

  const snapshot: DemoSnapshot | null = status?.latestSnapshot ?? null;

  return (
    <div className="space-y-6">
      <DemoHonestyBanner />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Live Crypto Range — Control Panel</h1>
          <p className="mt-1 text-sm text-[var(--color-gray-400)]">
            Flip enterprise demo resources and orchestrate scenes for the status wall.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/demo/live/status"
            className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-500/10"
          >
            Open status wall
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runMutation(reassessDemo)}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
          >
            Reassess now
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {snapshot ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase text-[var(--color-gray-500)]">Readiness</p>
            <p className="mt-1 text-3xl font-semibold text-white">{snapshot.readinessScore}</p>
            <p className="text-sm text-[var(--color-gray-400)]">{snapshot.readinessBand}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase text-[var(--color-gray-500)]">HNDL exposed</p>
            <p className="mt-1 text-3xl font-semibold text-white">{snapshot.hndlExposed}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase text-[var(--color-gray-500)]">Cadence</p>
            <p className="mt-1 text-3xl font-semibold text-white">{status?.cadenceSec ?? 60}s</p>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Demo Director</h2>
        <DirectorDeck scenes={scenes} busy={busy} onApply={(sceneId) => runMutation(() => applyDemoScene(sceneId))} />
      </section>

      <CampaignScrubber onRefresh={refresh} />

      <AlertFeed
        alerts={snapshot?.alerts ?? []}
        chaosEnabled={status?.chaosEnabled}
        onToggleChaos={(enabled) => runMutation(() => setDemoChaos(enabled))}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void runMutation(() => injectDemoEvent("cert-expiry"))}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50"
          >
            Inject cert expiry
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runMutation(() => injectDemoEvent("algorithm-downgrade"))}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50"
          >
            Inject downgrade
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runMutation(() => injectDemoEvent("new-quantum-vulnerable-asset"))}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50"
          >
            Add shadow asset
          </button>
        </div>
      </section>

      <section className="overflow-x-auto rounded-[var(--radius-lg)] border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black/40 text-xs uppercase text-[var(--color-gray-500)]">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Host</th>
              <th className="px-4 py-3">BU</th>
              <th className="px-4 py-3">Posture</th>
              <th className="px-4 py-3">Compliance</th>
              <th className="px-4 py-3">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {(status?.resources ?? []).map((resource) => (
              <tr key={resource.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">{resource.label}</td>
                <td className="px-4 py-3 text-[var(--color-gray-400)]">
                  {resource.host}
                  {resource.port ? `:${resource.port}` : ""}
                </td>
                <td className="px-4 py-3 text-[var(--color-gray-400)]">{resource.businessUnit}</td>
                <td className="px-4 py-3">
                  <select
                    value={resource.posture}
                    disabled={busy}
                    onChange={(event) =>
                      void updateResource(resource, { posture: event.target.value as DemoResource["posture"] })
                    }
                    className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                  >
                    {POSTURES.map((posture) => (
                      <option key={posture} value={posture}>
                        {posture}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={resource.complianceTarget}
                    disabled={busy}
                    onChange={(event) =>
                      void updateResource(resource, {
                        complianceTarget: event.target.value as DemoResource["complianceTarget"],
                      })
                    }
                    className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                  >
                    {COMPLIANCE.map((target) => (
                      <option key={target} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={resource.enabled}
                    disabled={busy}
                    onChange={(event) => void updateResource(resource, { enabled: event.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <form
        className="grid gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-black/20 p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          void runMutation(() =>
            createDemoResource({
              label: form.label,
              host: form.host,
              port: form.port ? Number(form.port) : null,
              kind: form.kind,
              businessUnit: form.businessUnit,
            })
          );
        }}
      >
        <input
          required
          placeholder="Label"
          value={form.label}
          onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
          className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          required
          placeholder="Host"
          value={form.host}
          onChange={(event) => setForm((prev) => ({ ...prev, host: event.target.value }))}
          className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          placeholder="Port"
          value={form.port}
          onChange={(event) => setForm((prev) => ({ ...prev, port: event.target.value }))}
          className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          placeholder="Business unit"
          value={form.businessUnit}
          onChange={(event) => setForm((prev) => ({ ...prev, businessUnit: event.target.value }))}
          className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-cyan-500/20 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-50"
        >
          Add resource
        </button>
      </form>
    </div>
  );
}
