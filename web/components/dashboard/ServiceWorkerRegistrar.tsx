"use client";

import { useEffect } from "react";

import { ccFlags } from "@/lib/cc-feature-flags";

/**
 * Registers the Command Center offline read shell service worker.
 * No-op when the PWA flag is off or the browser lacks service worker support.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!ccFlags.pwa) return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* best-effort — offline shell is a progressive enhancement */
      });
    };
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
