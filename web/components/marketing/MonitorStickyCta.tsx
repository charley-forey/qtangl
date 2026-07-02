"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

export default function MonitorStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-black/92 px-[var(--gutter-mobile)] py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-[var(--container-wide)] flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-gray-300)]">
          Continuous crypto drift monitoring — illustrative previews on this page.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            href="/access#monitor"
            size="sm"
            onClick={() => trackEvent("monitor_sticky_cta_click", { action: "pilot" })}
          >
            Request Monitor pilot
          </Button>
          <Button
            href="/dashboard"
            variant="secondary"
            size="sm"
            onClick={() => trackEvent("monitor_sticky_cta_click", { action: "dashboard" })}
          >
            Open dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
