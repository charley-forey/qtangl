"use client";

import { useState } from "react";

import type { AssessIntent } from "@/lib/assess-config";
import { assessIntentCopy } from "@/lib/copy/readiness-assess-intent";
import { trackEvent } from "@/lib/analytics";

import AssessEmailGatePanel from "./AssessEmailGatePanel";

type AssessIntentPickerProps = {
  activeIntent: AssessIntent;
  onIntentChange: (intent: AssessIntent) => void;
  onQuickSample: () => void;
  onQuickLiveDemo: () => void;
  isScanning: boolean;
  showCustomize: boolean;
  onToggleCustomize: () => void;
};

const INTENTS: AssessIntent[] = ["sample", "live-demo", "my-domain"];

export default function AssessIntentPicker({
  activeIntent,
  onIntentChange,
  onQuickSample,
  onQuickLiveDemo,
  isScanning,
  showCustomize,
  onToggleCustomize,
}: AssessIntentPickerProps) {
  const copy = assessIntentCopy;
  const [showEmailGate, setShowEmailGate] = useState(false);

  if (showEmailGate) {
    return (
      <AssessEmailGatePanel onDismiss={() => setShowEmailGate(false)} />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">{copy.heading}</h3>
        <p className="mt-1 text-xs leading-6 text-[var(--color-gray-400)]">{copy.subheading}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {INTENTS.map((intent) => {
          const item =
            intent === "sample"
              ? copy.sample
              : intent === "live-demo"
                ? copy.liveDemo
                : copy.myDomain;
          const active = activeIntent === intent;

          return (
            <button
              key={intent}
              type="button"
              onClick={() => {
                onIntentChange(intent);
                trackEvent("assess_intent_selected", { intent });
              }}
              className={`touch-target rounded-xl border p-4 text-left transition ${
                active
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-[var(--color-border)] bg-black/20 hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">{item.title}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-gray-300)]">
                  {item.badge}
                </span>
              </div>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{item.detail}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {activeIntent === "sample" ? (
          <button
            type="button"
            disabled={isScanning}
            onClick={() => {
              trackEvent("assess_quick_start", { intent: "sample" });
              onQuickSample();
            }}
            className="touch-target rounded-full border border-white bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-[var(--color-gray-200)] disabled:opacity-50"
          >
            {copy.sample.quickLabel}
          </button>
        ) : null}
        {activeIntent === "live-demo" ? (
          <button
            type="button"
            disabled={isScanning}
            onClick={() => {
              trackEvent("assess_quick_start", { intent: "live-demo" });
              onQuickLiveDemo();
            }}
            className="touch-target rounded-full border border-white bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-[var(--color-gray-200)] disabled:opacity-50"
          >
            {copy.liveDemo.quickLabel}
          </button>
        ) : null}
        {activeIntent === "my-domain" ? (
          <>
            <a
              href={copy.myDomain.quickHref}
              className="touch-target rounded-full border border-white bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-[var(--color-gray-200)]"
              onClick={() => trackEvent("assess_my_domain_cta", { destination: "assess_start" })}
            >
              {copy.myDomain.quickLabel}
            </a>
            <a
              href={copy.myDomain.pilotHref}
              className="touch-target rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm text-[var(--color-gray-300)] transition hover:border-white hover:text-white"
              onClick={() => trackEvent("assess_my_domain_cta", { destination: "access" })}
            >
              {copy.myDomain.pilotLabel}
            </a>
          </>
        ) : null}
        {activeIntent !== "my-domain" ? (
          <button
            type="button"
            onClick={() => {
              const nextOpen = !showCustomize;
              trackEvent("assess_customize_toggled", { open: nextOpen, intent: activeIntent });
              onToggleCustomize();
            }}
            className="touch-target text-xs text-[var(--color-gray-400)] underline underline-offset-4 hover:text-white"
          >
            {showCustomize ? "Hide customization" : activeIntent === "sample" ? copy.sample.customizeLabel : copy.liveDemo.customizeLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setShowEmailGate(true)}
          className="touch-target text-xs text-[var(--color-gray-400)] underline underline-offset-4 hover:text-white"
        >
          Scan one domain (work email)
        </button>
      </div>
    </div>
  );
}
