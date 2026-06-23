"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 1500;

export function useSessionExpiryWarning(
  enabled: boolean,
  onRetry?: () => Promise<void>
) {
  const [expiring, setExpiring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const retrying = useRef(false);
  const retryCount = useRef(0);
  const lastRetryAt = useRef(0);

  const handleUnauthorized = useCallback(async () => {
    if (!onRetry) {
      setExpiring(true);
      setMessage("Your session expired. Re-authenticate to continue.");
      return;
    }

    if (retrying.current) {
      return;
    }

    if (retryCount.current >= MAX_RETRIES) {
      setExpiring(true);
      setMessage("Your session expired. Sign out and sign in again to continue.");
      return;
    }

    const now = Date.now();
    const backoff = BASE_BACKOFF_MS * 2 ** retryCount.current;
    if (now - lastRetryAt.current < backoff) {
      return;
    }

    retrying.current = true;
    lastRetryAt.current = now;
    retryCount.current += 1;

    try {
      await onRetry();
      retryCount.current = 0;
      setExpiring(false);
      setMessage(null);
    } catch {
      if (retryCount.current >= MAX_RETRIES) {
        setExpiring(true);
        setMessage("Your session expired. Sign out and sign in again to continue.");
      }
    } finally {
      retrying.current = false;
    }
  }, [onRetry]);

  useEffect(() => {
    if (!enabled) {
      retryCount.current = 0;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url =
        typeof args[0] === "string"
          ? args[0]
          : args[0] instanceof Request
            ? args[0].url
            : String(args[0]);
      if (
        url.includes("/api/dashboard/") &&
        !url.includes("/api/dashboard/me") &&
        !url.includes("/api/dashboard/sign-out") &&
        !url.includes("/api/dashboard/analytics") &&
        response.status === 401
      ) {
        void handleUnauthorized();
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [enabled, handleUnauthorized]);

  return { expiring, message, clear: () => setExpiring(false) };
}
