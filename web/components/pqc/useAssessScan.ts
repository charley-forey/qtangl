"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AUTORUN_SCENARIO_IDS,
  isAssessResultTab,
  type AssessResultTab,
} from "@/lib/assess-config";
import { trackEvent } from "@/lib/analytics";
import { FALLBACK_SCENARIOS } from "@/lib/pqc-fallback";
import type { CryptoAsset, PqcScanResponse, ReportAvailabilityResponse, Scenario } from "@/lib/pqc";
import {
  getPqcInventory,
  getPqcScenarios,
  getReportAvailability,
  pollPqcScan,
  scanPqc,
  syncReportAfterScan,
  waitForPqcScan,
} from "@/lib/pqc";

export function useAssessScan({
  initialInventory,
  initialScenarios,
  initialBackendConnected,
  initialBackendMessage,
}: {
  initialInventory: CryptoAsset[];
  initialScenarios: Scenario[];
  initialBackendConnected: boolean;
  initialBackendMessage: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultScenarioId = initialScenarios[0]?.id ?? FALLBACK_SCENARIOS[0].id;

  const [inventory, setInventory] = useState(initialInventory);
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [backendConnected, setBackendConnected] = useState(initialBackendConnected);
  const [backendMessage, setBackendMessage] = useState(initialBackendMessage);
  const [activeScenarioId, setActiveScenarioId] = useState(defaultScenarioId);
  const [useFixture, setUseFixture] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [bundleSessionId, setBundleSessionId] = useState<string | null>(null);
  const [scanResponse, setScanResponse] = useState<PqcScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<string | null>(null);
  const [scanTimeline, setScanTimeline] = useState<PqcScanResponse["timeline"]>([]);
  const [isAutorunActive, setIsAutorunActive] = useState(false);
  const [useLiteScan, setUseLiteScan] = useState(false);
  const [reportAvailability, setReportAvailability] = useState<ReportAvailabilityResponse | null>(null);
  const [reportStatus, setReportStatus] = useState<"ready" | "checking" | "unavailable">("checking");
  const [urlSynced, setUrlSynced] = useState(false);
  const [activeTab, setActiveTab] = useState<AssessResultTab>("executive");
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardCollapsed, setWizardCollapsed] = useState(false);

  const bootstrapAttempted = useRef(false);
  const autorunAttempted = useRef(false);
  const scanIdHydrationAttempted = useRef(false);

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === activeScenarioId) ?? FALLBACK_SCENARIOS[0],
    [activeScenarioId, scenarios]
  );

  const syncUrl = useCallback(
    (overrides?: { scanId?: string }) => {
      const params = new URLSearchParams();
      params.set("scenario", activeScenarioId);
      params.set("useFixture", String(useFixture));
      if (bundleSessionId) params.set("session", bundleSessionId);
      const sid = overrides?.scanId ?? scanResponse?.scanId;
      if (sid) params.set("scanId", sid);
      if (activeTab !== "executive") params.set("tab", activeTab);
      if (searchParams.get("autorun") === "1") params.set("autorun", "1");
      router.replace(`/assess?${params.toString()}`, { scroll: false });
    },
    [activeScenarioId, useFixture, bundleSessionId, scanResponse, activeTab, router, searchParams]
  );

  useEffect(() => {
    trackEvent("assess_landing_view", { path: "/assess" });
    trackEvent("demo_viewed", { demo: "pqc" });
  }, []);

  useEffect(() => {
    const scenarioParam = searchParams.get("scenario") ?? searchParams.get("case");
    if (scenarioParam) setActiveScenarioId(scenarioParam);
    setUseFixture(searchParams.get("useFixture") !== "false");
    setUseLiteScan(searchParams.get("depth") === "lite");
    const session = searchParams.get("session");
    if (session) setBundleSessionId(session);
    const tabParam = searchParams.get("tab");
    if (isAssessResultTab(tabParam)) setActiveTab(tabParam);
    setUrlSynced(true);
  }, [searchParams]);

  useEffect(() => {
    if (bootstrapAttempted.current) return;
    if (initialBackendConnected && initialInventory.length > 0) {
      bootstrapAttempted.current = true;
      return;
    }
    bootstrapAttempted.current = true;
    let cancelled = false;
    async function connect() {
      try {
        const [inv, sc] = await Promise.all([getPqcInventory(), getPqcScenarios()]);
        if (cancelled) return;
        setInventory(inv.inventory);
        setScenarios(sc.scenarios);
        setBackendConnected(true);
        setBackendMessage(null);
      } catch (err) {
        if (cancelled) return;
        setBackendMessage(err instanceof Error ? err.message : "Unable to reach Qtangl PQC API.");
      }
    }
    connect();
    return () => {
      cancelled = true;
    };
  }, [initialBackendConnected, initialInventory.length]);

  useEffect(() => {
    const scanId = searchParams.get("scanId");
    if (!scanId || scanIdHydrationAttempted.current) return;
    scanIdHydrationAttempted.current = true;
    const hydratedScanId = scanId;
    let cancelled = false;
    async function hydrate() {
      setIsScanning(true);
      setError(null);
      try {
        const result = await pollPqcScan(hydratedScanId);
        if (cancelled) return;
        if (result.status === "success") {
          setScanResponse(result);
          setWizardCollapsed(true);
          const availability = await syncReportAfterScan(result.scanId, result);
          if (!cancelled) {
            setReportAvailability(availability);
            setReportStatus(availability.reportAvailable ? "ready" : "unavailable");
          }
        } else if (result.status === "error") {
          setError(result.message ?? "Scan not found or expired.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load scan.");
        }
      } finally {
        if (!cancelled) setIsScanning(false);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function checkReportAvailability() {
      if (!scanResponse?.scanId) {
        setReportAvailability(null);
        setReportStatus("checking");
        return;
      }
      setReportStatus("checking");
      try {
        const availability = await getReportAvailability(scanResponse.scanId);
        if (cancelled) return;
        setReportAvailability(availability);
        setReportStatus(availability.reportAvailable ? "ready" : "unavailable");
      } catch {
        if (cancelled) return;
        setReportAvailability(null);
        setReportStatus("unavailable");
      }
    }
    checkReportAvailability();
    return () => {
      cancelled = true;
    };
  }, [scanResponse?.scanId]);

  const handleScan = useCallback(
    async (source: "manual" | "autorun" = "manual") => {
      if (!useFixture && !authorized) {
        setError("Confirm you are authorized to scan this domain before live mode.");
        return;
      }
      setIsScanning(true);
      setError(null);
      setScanProgress(null);
      setScanTimeline([]);
      setIsAutorunActive(source === "autorun");
      const started = Date.now();
      const mode = useFixture ? "fixture" : "live";
      trackEvent("pqc_scan_started", {
        scenarioId: activeScenarioId,
        useFixture,
        mode,
        source,
        depth: useLiteScan ? "lite" : "standard",
        autorun: source === "autorun",
      });
      if (!useFixture && authorized) {
        trackEvent("live_scan_authorized", { scenarioId: activeScenarioId });
      }
      try {
        const result = await scanPqc({
          scenarioId: activeScenarioId,
          useFixture,
          target: customDomain || undefined,
          bundleSessionId: bundleSessionId ?? undefined,
          depth: useLiteScan ? "lite" : "standard",
        });
        let completed: PqcScanResponse;
        if (result.status === "running") {
          setScanProgress("Starting live scan…");
          completed = await waitForPqcScan(result.scanId, (timeline) => {
            if (!timeline?.length) return;
            setScanTimeline(timeline);
            const latest = timeline[timeline.length - 1];
            if (latest?.label) setScanProgress(latest.label);
          });
        } else {
          completed = result;
          if (completed.timeline?.length) setScanTimeline(completed.timeline);
        }
        setScanResponse(completed);
        setWizardCollapsed(true);
        setActiveTab("executive");
        trackEvent("pqc_scan_completed", {
          scenarioId: activeScenarioId,
          assets: completed.assets.length,
          qVulnerable: completed.scoreboard.qtangl.quantum_vulnerable,
          readinessScore: completed.scoreboard.qtangl.readiness_score,
          durationMs: Date.now() - started,
        });
        trackEvent("pqc_handshake_proved", { mode: completed.handshakeProof.mode });
        const availability = await syncReportAfterScan(completed.scanId, completed);
        setReportAvailability(availability);
        setReportStatus(availability.reportAvailable ? "ready" : "unavailable");
        syncUrl({ scanId: completed.scanId });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Scan failed");
      } finally {
        setIsScanning(false);
        setScanProgress(null);
        setIsAutorunActive(false);
      }
    },
    [
      useFixture,
      authorized,
      activeScenarioId,
      customDomain,
      bundleSessionId,
      useLiteScan,
      syncUrl,
    ]
  );

  useEffect(() => {
    if (!urlSynced || autorunAttempted.current || scanResponse || isScanning) return;
    const scenarioParam = searchParams.get("scenario") ?? searchParams.get("case");
    const autorun = searchParams.get("autorun") === "1";
    const shouldAutorun =
      autorun || (scenarioParam != null && AUTORUN_SCENARIO_IDS.has(scenarioParam));
    if (!shouldAutorun || !scenarioParam) return;
    if (!useFixture && !authorized) return;
    autorunAttempted.current = true;
    void handleScan("autorun");
  }, [urlSynced, searchParams, scanResponse, isScanning, useFixture, authorized, handleScan]);

  const selectScenario = useCallback((id: string) => {
    setActiveScenarioId(id);
    setCustomDomain("");
    trackEvent("scenario_changed", { scenarioId: id });
  }, []);

  const changeTab = useCallback(
    (tab: AssessResultTab) => {
      setActiveTab(tab);
      trackEvent("assess_tab_changed", { tab, scanId: scanResponse?.scanId });
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`/assess?${params.toString()}`, { scroll: false });
    },
    [scanResponse?.scanId, searchParams, router]
  );

  const setBundleSession = useCallback(
    (sessionId: string) => {
      setBundleSessionId(sessionId);
      const params = new URLSearchParams(searchParams.toString());
      params.set("session", sessionId);
      router.replace(`/assess?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  return {
    inventory,
    scenarios,
    backendConnected,
    backendMessage,
    activeScenarioId,
    activeScenario,
    useFixture,
    setUseFixture,
    authorized,
    setAuthorized,
    customDomain,
    setCustomDomain,
    bundleSessionId,
    setBundleSession,
    scanResponse,
    isScanning,
    error,
    setError,
    scanProgress,
    scanTimeline,
    isAutorunActive,
    useLiteScan,
    setUseLiteScan,
    reportAvailability,
    reportStatus,
    urlSynced,
    activeTab,
    changeTab,
    wizardStep,
    setWizardStep,
    wizardCollapsed,
    setWizardCollapsed,
    handleScan,
    selectScenario,
    syncUrl,
  };
}
