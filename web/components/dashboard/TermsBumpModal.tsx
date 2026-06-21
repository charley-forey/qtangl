"use client";

import LegalAcceptancePanel, { type LegalAcceptBilling } from "@/components/dashboard/LegalAcceptancePanel";

type Props = {
  open: boolean;
  scanAllowlist?: string[];
  onAccepted: (billing: LegalAcceptBilling) => void;
};

export default function TermsBumpModal({ open, scanAllowlist = [], onAccepted }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="max-w-lg rounded-2xl border border-[var(--border-strong)] bg-black p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Terms update required</h2>
        <p className="mt-2 text-sm text-[var(--color-gray-300)]">
          Review and accept the updated Terms of Service before continuing in the dashboard.
        </p>
        <div className="mt-4">
          <LegalAcceptancePanel
            policyUpdated
            requireScanAuthorization={scanAllowlist.length > 0}
            domain={scanAllowlist[0] ?? ""}
            onAccepted={onAccepted}
          />
        </div>
      </div>
    </div>
  );
}
