"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { convertStickyCta } from "@/lib/copy/readiness-convert";
import { trackEvent } from "@/lib/analytics";

export default function ConvertStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 480);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-black/92 px-[var(--gutter-mobile)] py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-[var(--container-wide)] flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-gray-300)]">{convertStickyCta.message}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            href={convertStickyCta.primary.href}
            size="sm"
            onClick={() => trackEvent("convert_sticky_cta_click", { action: "pilot" })}
          >
            {convertStickyCta.primary.label}
          </Button>
          <Button
            href={convertStickyCta.secondary.href}
            variant="secondary"
            size="sm"
            onClick={() => trackEvent("convert_sticky_cta_click", { action: "dashboard" })}
          >
            {convertStickyCta.secondary.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
