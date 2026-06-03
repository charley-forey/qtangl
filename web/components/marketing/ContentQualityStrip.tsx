import { qDaySourcesLastVerified } from "@/lib/copy/q-day-sources";

export default function ContentQualityStrip() {
  return (
    <aside className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/30 p-4 text-xs leading-6 text-[var(--color-gray-400)]">
      <p>
        <strong className="text-[var(--color-gray-300)]">Honest caveat:</strong> Quantum-vulnerable
        does not mean broken today. Qtangl provides an inventory aid — not a formal audit or
        attestation. Sources last verified {qDaySourcesLastVerified}.
      </p>
    </aside>
  );
}
