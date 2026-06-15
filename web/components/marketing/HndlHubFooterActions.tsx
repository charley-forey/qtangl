"use client";

import Button from "@/components/ui/Button";
import HndlTrackedLink from "@/components/marketing/HndlTrackedLink";
import { trackEvent } from "@/lib/analytics";
import { buildAssessMiniHref } from "@/lib/hndl-funnel";

export default function HndlHubFooterActions() {
  const assessHref = buildAssessMiniHref({
    source: "q-day-hndl",
    content: "footer",
  });

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        href={assessHref}
        onClick={() =>
          trackEvent("hndl_cta_click", { destination: assessHref, placement: "footer" })
        }
      >
        Free mini-assessment
      </Button>
      <Button
        href="/assess"
        variant="secondary"
        onClick={() =>
          trackEvent("hndl_cta_click", { destination: "/assess", placement: "footer" })
        }
      >
        Try PQC demo
      </Button>
      <HndlTrackedLink
        href="/q-day"
        placement="footer"
        className="inline-flex items-center text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
      >
        ← Q-Day hub
      </HndlTrackedLink>
    </div>
  );
}
