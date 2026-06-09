"use client";

import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { trackEvent } from "@/lib/analytics";

type ComparisonCtaProps = {
  onGuideClick?: () => void;
  source?: string;
};

export default function ComparisonCta({ onGuideClick, source = "compare" }: ComparisonCtaProps) {
  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Next steps</Eyebrow>
      <h2 className="mt-4 text-2xl font-semibold text-white">Validate Qtangl on your estate</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-gray-300)]">
        Run a free Q-Day scan, download the full vendor comparison guide, or talk with our team
        about your shortlist.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          href="/assess"
          onClick={() => trackEvent("comparison_cta_click", { action: "assess", source })}
        >
          Run a free Q-Day scan
        </Button>
        {onGuideClick ? (
          <Button variant="secondary" onClick={onGuideClick}>
            Get comparison guide (PDF)
          </Button>
        ) : (
          <Button
            href="/compare#guide"
            variant="secondary"
            onClick={() => trackEvent("comparison_cta_click", { action: "guide", source })}
          >
            Get comparison guide (PDF)
          </Button>
        )}
        <Button
          href="/access"
          variant="secondary"
          onClick={() => trackEvent("comparison_cta_click", { action: "access", source })}
        >
          Compare with our team
        </Button>
      </div>
      <p className="mt-4 text-xs text-[var(--color-gray-500)]">
        <Link href="/verify" className="underline-offset-4 hover:text-white hover:underline">
          Verify a signed report
        </Link>
        {" · "}
        <Link href="/pricing" className="underline-offset-4 hover:text-white hover:underline">
          Pricing
        </Link>
      </p>
    </Card>
  );
}
