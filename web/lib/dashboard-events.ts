"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchDashboardSummaryViaBff } from "@/lib/dashboard-transport";

export type DashboardEvent = {
  type: string;
  data?: Record<string, unknown>;
};

const INITIAL_RECONNECT_MS = 3_000;
const MAX_RECONNECT_MS = 30_000;
const DEGRADED_AFTER_FAILURES = 2;

export function useDashboardEvents({
  enabled,
  onEvent,
}: {
  enabled: boolean;
  onEvent?: (event: DashboardEvent) => void;
}) {
  const [connected, setConnected] = useState(false);
  const [eventsDegraded, setEventsDegraded] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failuresRef = useRef(0);
  const backoffRef = useRef(INITIAL_RECONNECT_MS);
  onEventRef.current = onEvent;

  const reconnectSummary = useCallback(async () => {
    try {
      await fetchDashboardSummaryViaBff();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    function scheduleReconnect(connect: () => void) {
      if (cancelled || reconnectTimerRef.current) return;
      failuresRef.current += 1;
      if (failuresRef.current >= DEGRADED_AFTER_FAILURES) {
        setEventsDegraded(true);
      }
      const delay = backoffRef.current;
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        void reconnectSummary();
        connect();
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_RECONNECT_MS);
      }, delay);
    }

    function connect() {
      sourceRef.current?.close();
      const source = new EventSource("/api/dashboard/events");
      sourceRef.current = source;

      source.onopen = () => {
        setConnected(true);
        setEventsDegraded(false);
        failuresRef.current = 0;
        backoffRef.current = INITIAL_RECONNECT_MS;
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      source.addEventListener("heartbeat", () => undefined);

      source.addEventListener("scan", (message) => {
        try {
          const data = JSON.parse(message.data) as Record<string, unknown>;
          onEventRef.current?.({ type: "scan", data });
        } catch {
          onEventRef.current?.({ type: "scan" });
        }
      });

      source.onerror = () => {
        setConnected(false);
        source.close();
        scheduleReconnect(connect);
      };
    }

    connect();

    return () => {
      cancelled = true;
      sourceRef.current?.close();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [enabled, reconnectSummary]);

  return { connected, eventsDegraded };
}
