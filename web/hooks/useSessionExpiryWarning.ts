"use client";

import { useCallback, useEffect, useState } from "react";

export function useSessionExpiryWarning(enabled: boolean) {
  const [expiring, setExpiring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    setExpiring(true);
    setMessage("Your session expired. Re-authenticate to continue.");
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0]);
      if (url.includes("/api/dashboard/") && response.status === 401) {
        handleUnauthorized();
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [enabled, handleUnauthorized]);

  return { expiring, message, clear: () => setExpiring(false) };
}
