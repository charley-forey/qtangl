"use client";

import { useCallback, useEffect, useState } from "react";

import { createFleet, listFleets, rotateFleetToken } from "@/lib/discovery";

type FleetEnrollmentPanelProps = {
  apiKey?: string;
  useBff?: boolean;
};

export default function FleetEnrollmentPanel({ apiKey = "", useBff = false }: FleetEnrollmentPanelProps) {
  const auth = useBff ? { useBff: true as const } : { apiKey };
  const [fleetName, setFleetName] = useState("Production fleet");
  const [token, setToken] = useState<string | null>(null);
  const [fleetId, setFleetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [osTab, setOsTab] = useState<"linux" | "windows" | "macos" | "k8s">("linux");
  const [enrollmentNonce, setEnrollmentNonce] = useState<string | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL ?? "https://api.qtangl.com";

  const loadFleets = useCallback(async () => {
    try {
      const res = await listFleets(auth);
      const first = res.fleets?.[0];
      if (first?.fleetId) setFleetId(first.fleetId);
    } catch {
      /* optional */
    }
  }, [useBff, apiKey]);

  useEffect(() => {
    void loadFleets();
  }, [loadFleets]);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const res = await createFleet(auth, fleetName);
      setToken(res.enrollmentToken);
      setFleetId(res.fleetId);
      setEnrollmentNonce(res.enrollmentNonce ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create fleet");
    } finally {
      setLoading(false);
    }
  }

  async function handleRotate() {
    if (!fleetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await rotateFleetToken(auth, fleetId);
      setToken(res.enrollmentToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rotate token");
    } finally {
      setLoading(false);
    }
  }

  const installCommands: Record<string, string> = token
    ? {
        linux: `curl -fsSL https://releases.qtangl.com/sensor/install.sh | QTANGL_ENROLL_TOKEN=${token} QTANGL_API=${apiBase} sh -s -- --enroll`,
        windows: `msiexec /i qtangl-sensor.msi /qn ENROLLMENT_TOKEN=${token} QTANGL_API=${apiBase}`,
        macos: `QTANGL_ENROLL_TOKEN=${token} QTANGL_API=${apiBase} /usr/local/bin/qtangl-sensor --enroll`,
        k8s: `helm upgrade --install qtangl-sensor ./sensor/packaging/helm/qtangl-sensor --set enrollmentToken=${token} --set apiUrl=${apiBase}`,
      }
    : { linux: "", windows: "", macos: "", k8s: "" };

  const postEnrollSteps = token
    ? `# After enroll, save certPem from JSON output, then run daemon:
export QTANGL_AGENT_ID=<agentId from enroll output>
export QTANGL_TENANT_ID=<tenantId>
export QTANGL_AGENT_CERT=/path/to/agent.pem
qtangl-sensor --daemon --api ${apiBase}${enrollmentNonce ? `\n# Enrollment nonce (if prompted): ${enrollmentNonce}` : ""}`
    : "";

  const activeCmd = installCommands[osTab];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">Host sensor fleet</h3>
      <p className="text-sm text-[var(--muted)]">
        Deploy the Qtangl Unified Sensor to inventory certificates, libraries, and listeners on your hosts.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          className="input flex-1 min-w-[12rem]"
          value={fleetName}
          onChange={(e) => setFleetName(e.target.value)}
          placeholder="Fleet name"
        />
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleCreate}>
          {loading ? "Creating…" : "Create fleet"}
        </button>
        {fleetId && (
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={handleRotate}>
            Rotate token
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {token && (
        <div className="surface-panel space-y-3 rounded-[var(--radius-lg)] p-4 text-sm">
          <p>
            <span className="font-medium">Fleet ID:</span> {fleetId}
          </p>
          <div className="flex gap-2">
            {(["linux", "windows", "macos", "k8s"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`rounded px-2 py-1 text-xs capitalize ${osTab === t ? "bg-[var(--accent)] text-white" : "border border-[var(--border)]"}`}
                onClick={() => setOsTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs">{activeCmd}</pre>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            onClick={() => navigator.clipboard.writeText(activeCmd)}
          >
            Copy install command
          </button>
          {postEnrollSteps ? (
            <>
              <p className="text-xs font-medium text-[var(--foreground)]">Post-enroll daemon</p>
              <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs">{postEnrollSteps}</pre>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
