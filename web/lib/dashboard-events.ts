"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchDashboardSummaryViaBff } from "@/lib/dashboard-transport";

export type DashboardEvent = {
  type: string;
  data?: Record<string, unknown>;
};

export function useDashboardEvents({
  enabled,
  onEvent,
}: {
  enabled: boolean;
  onEvent?: (event: DashboardEvent) => void;
}) {
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
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

    let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      const source = new EventSource("/api/dashboard/events");
      sourceRef.current = source;

      source.onopen = () => {
        setConnected(true);
        if (disconnectTimer) {
          clearTimeout(disconnectTimer);
          disconnectTimer = null;
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
        if (!disconnectTimer) {
          disconnectTimer = setTimeout(() => {
            void reconnectSummary();
            connect();
          }, 60_000);
        }
      };
    }

    connect();

    return () => {
      sourceRef.current?.close();
      if (disconnectTimer) clearTimeout(disconnectTimer);
    };
  }, [enabled, reconnectSummary]);

  return { connected };
}
