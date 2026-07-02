"use client";

import { useSearchParams } from "next/navigation";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { moscaInequalityHolds, readMoscaFromSearchParams } from "@/lib/assess-mosca-url";

export default function AssessMoscaContextBanner() {
  const searchParams = useSearchParams();
  const mosca = readMoscaFromSearchParams(searchParams);
  if (!mosca) return null;

  const holds = moscaInequalityHolds(mosca);

  return (
    <Card tone="feature" className="mb-6 rounded-[var(--radius-xl)]" role="status">
      <Eyebrow>Mosca inputs from calculator</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">
        X={mosca.dataYears}y · Y={mosca.migrationYears}y · Z={mosca.quantumYears}y —{" "}
        {holds ? "inequality holds (HNDL exposure)" : "inequality does not hold"}.
        Results will reference your planning horizon alongside scenario defaults.
      </p>
    </Card>
  );
}
