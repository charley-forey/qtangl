"use client";

import Link from "next/link";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { postDashboardJson } from "@/lib/dashboard-bff";

const TERMS_VERSION = "2026-06-08";

type Props = {
  onAccepted?: () => void;
  requireScanAuthorization?: boolean;
  domain?: string;
};

export default function LegalAcceptancePanel({
  onAccepted,
  requireScanAuthorization = false,
  domain = "",
}: Props) {
  const [termsChecked, setTermsChecked] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = termsChecked && (!requireScanAuthorization || authChecked);

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-black/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
        Legal & compliance
      </p>
      <label className="flex items-start gap-3 text-sm text-[var(--color-gray-300)]">
        <input
          type="checkbox"
          className="mt-1"
          checked={termsChecked}
          onChange={(e) => setTermsChecked(e.target.checked)}
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="underline hover:text-white">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {requireScanAuthorization ? (
        <label className="flex items-start gap-3 text-sm text-[var(--color-gray-300)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={authChecked}
            onChange={(e) => setAuthChecked(e.target.checked)}
          />
          <span>
            I am authorized to scan{" "}
            <strong className="text-white">{domain || "the domains listed in this workspace"}</strong> for my
            organization.
          </span>
        </label>
      ) : null}
      <p className="text-xs text-[var(--color-gray-500)]">
        Trust center:{" "}
        <Link href="/trust" className="underline hover:text-white">
          security & subprocessors
        </Link>
        {" · "}
        <Link href="/trust/subprocessors" className="underline hover:text-white">
          DPA on request
        </Link>
      </p>
      <Button
        type="button"
        disabled={!canSubmit || saving}
        onClick={async () => {
          setSaving(true);
          setError(null);
          try {
            await postDashboardJson("/tenant/legal/accept", {
              termsVersion: TERMS_VERSION,
              scanAuthorization: requireScanAuthorization ? true : undefined,
              domain: domain || undefined,
            });
            onAccepted?.();
          } catch (exc) {
            setError(exc instanceof Error ? exc.message : "Unable to save acceptance.");
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving…" : "Continue"}
      </Button>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
