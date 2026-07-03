"use client";

import { useEffect, useRef } from "react";

/** Closes an anchored menu/disclosure on outside click or Escape. Attach the returned ref to its container. */
export function useMenuDismissal<T extends HTMLElement = HTMLDivElement>(open: boolean, close: () => void) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  return containerRef;
}
