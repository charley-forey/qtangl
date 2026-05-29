import { EvFleetSection } from "./ui";

export default function DemoGuideStrip() {
  return (
    <EvFleetSection tone="panel">
      <ol className="grid gap-3 text-sm text-[var(--color-gray-300)] md:grid-cols-4">
        <li>1. Upload fleet + stops (optional)</li>
        <li>2. Pick a TOU / disruption scenario</li>
        <li>3. Run VRP then charger-queue hybrid solve</li>
        <li>4. Open audit pack for QUBO + QPU trace</li>
      </ol>
    </EvFleetSection>
  );
}
