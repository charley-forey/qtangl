"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { demoEventsUrl } from "@/lib/demo";

export type DemoEvent = {
  type: string;
  data?: Record<string, unknown>;
};

const INITIAL_RECONNECT_MS = 3_000;
const MAX_RECONNECT_MS = 30_000;

export function useDemoEvents({
  enabled,
  onEvent,
  pollFallbackMs = 15_000,
  onPoll,
}: {
  enabled: boolean;
  onEvent?: (event: DemoEvent) => void;
  pollFallbackMs?: number;
  onPoll?: () => void | Promise<void>;
}) {
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  const onPollRef = useRef(onPoll);
  onEventRef.current = onEvent;
  onPollRef.current = onPoll;

  const poll = useCallback(async () => {
    try {
      await onPollRef.current?.();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    let cancelled = false;
    let backoff = INITIAL_RECONNECT_MS;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    function scheduleReconnect(connect: () => void) {
      if (cancelled || reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void poll();
        connect();
        backoff = Math.min(backoff * 2, MAX_RECONNECT_MS);
      }, backoff);
    }

    function connect() {
      sourceRef.current?.close();
      const source = new EventSource(demoEventsUrl());
      sourceRef.current = source;

      source.onopen = () => {
        setConnected(true);
        backoff = INITIAL_RECONNECT_MS;
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      };

      source.onerror = () => {
        setConnected(false);
        source.close();
        scheduleReconnect(connect);
      };

      source.addEventListener("heartbeat", () => undefined);

      const handle = (type: string) => (message: MessageEvent) => {
        try {
          const data = JSON.parse(String(message.data)) as Record<string, unknown>;
          onEventRef.current?.({ type, data });
        } catch {
          onEventRef.current?.({ type });
        }
      };

      ["snapshot", "alert", "narration", "scene", "chaos", "campaign"].forEach((type) => {
        source.addEventListener(type, handle(type));
      });
    }

    connect();
    pollTimer = setInterval(() => {
      void poll();
    }, pollFallbackMs);

    return () => {
      cancelled = true;
      sourceRef.current?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [enabled, poll, pollFallbackMs]);

  return { connected };
}
