"use client";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
import { buildAssessMiniHref } from "@/lib/hndl-funnel";

export default function HndlHubHeroActions() {
  const assessHref = buildAssessMiniHref({
    source: "q-day-hndl",
    content: "hero",
  });

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button
        href={assessHref}
        onClick={() =>
          trackEvent("hndl_cta_click", {
            destination: assessHref,
            placement: "hero",
          })
        }
      >
        Free mini-assessment
      </Button>
      <Button
        href="/q-day"
        variant="secondary"
        onClick={() =>
          trackEvent("hndl_cta_click", {
            destination: "/q-day",
            placement: "hero",
          })
        }
      >
        Back to hub
      </Button>
    </div>
  );
}
