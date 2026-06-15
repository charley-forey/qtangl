"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AUTORUN_SCENARIO_IDS,
  PUBLIC_DEMO_LIVE_HOSTS,
  isAssessResultTab,
  type AssessResultTab,
} from "@/lib/assess-config";
import { trackEvent } from "@/lib/analytics";
import type { AssessApiMode } from "@/lib/qtangl-api-context";
import { assessAnalyticsMode } from "@/lib/qtangl-api-context";
import { FALLBACK_SCENARIOS } from "@/lib/pqc-fallback";
import type { CryptoAsset, PqcScanResponse, ReportAvailabilityResponse, Scenario } from "@/lib/pqc";
import {
  getAuthorizedDomains,
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
  assessMode = "demo",
  apiKey,
  basePath = "/assess",
  syncUrlEnabled = true,
}: {
  initialInventory: CryptoAsset[];
  initialScenarios: Scenario[];
  initialBackendConnected: boolean;
  initialBackendMessage: string | null;
  assessMode?: AssessApiMode;
  apiKey?: string;
  basePath?: string;
  syncUrlEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProduction = assessMode === "production";
  const defaultScenarioId = initialScenarios[0]?.id ?? FALLBACK_SCENARIOS[0].id;
  const analyticsMode = assessAnalyticsMode(assessMode);

  const [inventory, setInventory] = useState(initialInventory);
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [backendConnected, setBackendConnected] = useState(initialBackendConnected);
  const [backendMessage, setBackendMessage] = useState(initialBackendMessage);
  const [activeScenarioId, setActiveScenarioId] = useState(defaultScenarioId);
  const [useFixture, setUseFixture] = useState(!isProduction);
  const [authorized, setAuthorized] = useState(isProduction);
  const [customDomain, setCustomDomain] = useState("");
  const [industry, setIndustry] = useState("financial");
  const [authorizedDomains, setAuthorizedDomains] = useState<string[]>([]);
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
      if (!syncUrlEnabled) return;
      const params = new URLSearchParams();
      if (isProduction) {
        params.set("mode", "production");
      } else {
        params.set("scenario", activeScenarioId);
        params.set("useFixture", String(useFixture));
      }
      if (bundleSessionId) params.set("session", bundleSessionId);
      const sid = overrides?.scanId ?? scanResponse?.scanId;
      if (sid) params.set("scanId", sid);
      if (activeTab !== "executive") params.set("tab", activeTab);
      if (!isProduction && searchParams.get("autorun") === "1") params.set("autorun", "1");
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [
      activeScenarioId,
      useFixture,
      bundleSessionId,
      scanResponse,
      activeTab,
      router,
      searchParams,
      basePath,
      syncUrlEnabled,
      isProduction,
    ]
  );

  useEffect(() => {
    trackEvent("assess_landing_view", { path: basePath, mode: analyticsMode });
    if (!isProduction) {
      trackEvent("demo_viewed", { demo: "pqc", mode: analyticsMode });
    }
  }, [basePath, analyticsMode, isProduction]);

  useEffect(() => {
    if (isProduction) {
      setUseFixture(false);
      setAuthorized(true);
      return;
    }
    const scenarioParam = searchParams.get("scenario") ?? searchParams.get("case");
    if (scenarioParam) setActiveScenarioId(scenarioParam);
    setUseFixture(searchParams.get("useFixture") !== "false");
    setUseLiteScan(searchParams.get("depth") === "lite");
    const session = searchParams.get("session");
    if (session) setBundleSessionId(session);
    const tabParam = searchParams.get("tab");
    if (isAssessResultTab(tabParam)) setActiveTab(tabParam);
    setUrlSynced(true);
  }, [searchParams, isProduction]);

  useEffect(() => {
    if (isProduction) {
      setUrlSynced(true);
    }
  }, [isProduction]);

  useEffect(() => {
    if (!isProduction || !apiKey) return;
    let cancelled = false;
    async function loadDomains() {
      try {
        const response = await getAuthorizedDomains(apiKey!);
        if (!cancelled) {
          setAuthorizedDomains(response.domains ?? []);
          if (response.domains?.length === 1) {
            setCustomDomain(response.domains[0]);
          }
        }
      } catch {
        if (!cancelled) setAuthorizedDomains([]);
      }
    }
    void loadDomains();
    return () => {
      cancelled = true;
    };
  }, [isProduction, apiKey]);

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
        const [inv, sc] = await Promise.all([
          getPqcInventory(apiKey),
          getPqcScenarios(apiKey),
        ]);
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
  }, [initialBackendConnected, initialInventory.length, apiKey]);

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
        const result = await pollPqcScan(hydratedScanId, apiKey);
        if (cancelled) return;
        if (result.status === "success") {
          setScanResponse(result);
          setWizardCollapsed(true);
          const availability = await syncReportAfterScan(result.scanId, result, apiKey);
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
  }, [searchParams, apiKey]);

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
        const availability = await getReportAvailability(scanResponse.scanId, apiKey);
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
  }, [scanResponse?.scanId, apiKey]);

  const handleScan = useCallback(
    async (source: "manual" | "autorun" = "manual") => {
      if (isProduction && !apiKey) {
        setError("Connect your tenant API key before running a production baseline.");
        return;
      }
      if (!useFixture && !authorized) {
        setError("Confirm you are authorized to scan this domain before live mode.");
        return;
      }
      if (!useFixture && !isProduction && customDomain) {
        const normalized = customDomain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
        if (!PUBLIC_DEMO_LIVE_HOSTS.has(normalized)) {
          setError(
            "Public demo live scans are limited to approved targets (e.g. test.openquantumsafe.org). Use fixture mode or request a pilot for your domain."
          );
          return;
        }
      }
      if (isProduction && !useFixture && !bundleSessionId) {
        if (!customDomain) {
          setError("Select an authorized domain or upload a certificate bundle.");
          return;
        }
        if (authorizedDomains.length > 0 && !authorizedDomains.includes(customDomain.toLowerCase())) {
          setError("Selected domain is not on your authorized list.");
          return;
        }
      }

      setIsScanning(true);
      setError(null);
      setScanProgress(null);
      setScanTimeline([]);
      setIsAutorunActive(source === "autorun");
      const started = Date.now();
      const scanMode = useFixture ? "fixture" : "live";
      trackEvent("pqc_scan_started", {
        scenarioId: activeScenarioId,
        useFixture,
        mode: scanMode,
        assessMode: analyticsMode,
        source,
        depth: useLiteScan ? "lite" : "standard",
        autorun: source === "autorun",
        industry: isProduction ? industry : undefined,
      });
      if (!useFixture && authorized) {
        trackEvent("live_scan_authorized", {
          scenarioId: activeScenarioId,
          assessMode: analyticsMode,
          domain: customDomain || undefined,
        });
      }
      try {
        const result = await scanPqc(
          {
            scenarioId: isProduction ? "bank-tls-inventory" : activeScenarioId,
            useFixture: isProduction ? false : useFixture,
            target: customDomain || undefined,
            bundleSessionId: bundleSessionId ?? undefined,
            depth: useLiteScan ? "lite" : "standard",
            industry: isProduction ? industry : undefined,
          },
          { apiKey: isProduction ? apiKey : undefined }
        );
        let completed: PqcScanResponse;
        if (result.status === "running") {
          setScanProgress("Starting live scan…");
          completed = await waitForPqcScan(
            result.scanId,
            (timeline) => {
              if (!timeline?.length) return;
              setScanTimeline(timeline);
              const latest = timeline[timeline.length - 1];
              if (latest?.label) setScanProgress(latest.label);
            },
            isProduction ? apiKey : undefined
          );
        } else {
          completed = result;
          if (completed.timeline?.length) setScanTimeline(completed.timeline);
        }
        setScanResponse(completed);
        setWizardCollapsed(true);
        setActiveTab("executive");
        trackEvent("pqc_scan_completed", {
          scenarioId: activeScenarioId,
          assessMode: analyticsMode,
          assets: completed.assets.length,
          qVulnerable: completed.scoreboard.qtangl.quantum_vulnerable,
          readinessScore: completed.scoreboard.qtangl.readiness_score,
          durationMs: Date.now() - started,
        });
        trackEvent("pqc_handshake_proved", { mode: completed.handshakeProof.mode, assessMode: analyticsMode });
        const availability = await syncReportAfterScan(
          completed.scanId,
          completed,
          isProduction ? apiKey : undefined
        );
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
      isProduction,
      apiKey,
      useFixture,
      authorized,
      activeScenarioId,
      customDomain,
      bundleSessionId,
      useLiteScan,
      syncUrl,
      industry,
      authorizedDomains,
      analyticsMode,
    ]
  );

  useEffect(() => {
    if (isProduction || !urlSynced || autorunAttempted.current || scanResponse || isScanning) return;
    const scenarioParam = searchParams.get("scenario") ?? searchParams.get("case");
    const autorun = searchParams.get("autorun") === "1";
    const shouldAutorun =
      autorun || (scenarioParam != null && AUTORUN_SCENARIO_IDS.has(scenarioParam));
    if (!shouldAutorun || !scenarioParam) return;
    if (!useFixture && !authorized) return;
    autorunAttempted.current = true;
    void handleScan("autorun");
  }, [
    isProduction,
    urlSynced,
    searchParams,
    scanResponse,
    isScanning,
    useFixture,
    authorized,
    handleScan,
  ]);

  const selectScenario = useCallback((id: string) => {
    setActiveScenarioId(id);
    setCustomDomain("");
    trackEvent("scenario_changed", { scenarioId: id, assessMode: analyticsMode });
  }, [analyticsMode]);

  const changeTab = useCallback(
    (tab: AssessResultTab) => {
      setActiveTab(tab);
      trackEvent("assess_tab_changed", { tab, scanId: scanResponse?.scanId, assessMode: analyticsMode });
      if (!syncUrlEnabled) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [scanResponse?.scanId, searchParams, router, basePath, syncUrlEnabled, analyticsMode]
  );

  const setBundleSession = useCallback(
    (sessionId: string) => {
      setBundleSessionId(sessionId);
      if (!syncUrlEnabled) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("session", sessionId);
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, basePath, syncUrlEnabled]
  );

  return {
    assessMode,
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
    industry,
    setIndustry,
    authorizedDomains,
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
