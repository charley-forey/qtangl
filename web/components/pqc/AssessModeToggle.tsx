"use client";

import { OQS_DEMO_HOST } from "@/lib/assess-config";
import { ASSESS_EVENTS } from "@/lib/analytics/assess-events";
import { trackEvent } from "@/lib/analytics";

type AssessModeToggleProps = {
  useFixture: boolean;
  onUseFixtureChange: (value: boolean) => void;
  onApplyOqsPreset?: () => void;
  showOqsPreset?: boolean;
  disabled?: boolean;
};

export default function AssessModeToggle({
  useFixture,
  onUseFixtureChange,
  onApplyOqsPreset,
  showOqsPreset = false,
  disabled = false,
}: AssessModeToggleProps) {
  return (
    <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-black/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-gray-400)]">Scan mode</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onUseFixtureChange(true);
            trackEvent(ASSESS_EVENTS.modeChanged, { mode: "fixture" });
          }}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            useFixture
              ? "border-white bg-white text-black"
              : "border-[var(--color-border)] text-[var(--color-gray-300)] hover:text-white"
          }`}
        >
          Fixture (offline sample)
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onUseFixtureChange(false);
            trackEvent(ASSESS_EVENTS.modeChanged, { mode: "live" });
          }}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            !useFixture
              ? "border-white bg-white text-black"
              : "border-[var(--color-border)] text-[var(--color-gray-300)] hover:text-white"
          }`}
        >
          Live scan
        </button>
      </div>
      {useFixture ? (
        <p className="text-xs leading-6 text-[var(--color-gray-400)]">
          No domain or network required. Uses pre-built scenario data — best for first visits and board
          demos.
        </p>
      ) : (
        <p className="text-xs leading-6 text-[var(--color-gray-400)]">
          Real TLS handshake against an approved public target. Confirm authorization below before running.
        </p>
      )}
      {showOqsPreset && !useFixture && onApplyOqsPreset ? (
        <button
          type="button"
          onClick={onApplyOqsPreset}
          className="text-xs font-medium text-white underline underline-offset-4 hover:text-[var(--color-gray-200)]"
        >
          Use {OQS_DEMO_HOST} (Open Quantum Safe test server)
        </button>
      ) : null}
    </div>
  );
}
