"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useQrosQuery<T>(fetcher: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    void fetcherRef
      .current()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setError("Request failed");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Request failed");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps drive refetch
  }, deps);

  return { data, loading, error, reload };
}
