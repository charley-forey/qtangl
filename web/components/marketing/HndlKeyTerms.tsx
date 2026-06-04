"use client";

import InfoTip from "@/components/pqc/InfoTip";

type HndlKeyTermsProps = {
  termIds: readonly string[];
};

export default function HndlKeyTerms({ termIds }: HndlKeyTermsProps) {
  if (!termIds.length) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="text-label text-[var(--color-gray-500)]">Key terms</span>
      {termIds.map((termId) => (
        <InfoTip key={termId} termId={termId} />
      ))}
    </div>
  );
}
