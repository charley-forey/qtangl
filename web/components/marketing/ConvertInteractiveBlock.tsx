"use client";

import ConvertEvidencePreview from "@/components/marketing/ConvertEvidencePreview";
import ConvertInventoryEmbed from "@/components/marketing/ConvertInventoryEmbed";
import ConvertMigrationDiagram from "@/components/marketing/ConvertMigrationDiagram";
import ConvertProgramSimulator from "@/components/marketing/ConvertProgramSimulator";
import ConvertVerifyFixLoop from "@/components/marketing/ConvertVerifyFixLoop";
import { ConvertDemoProvider } from "@/components/marketing/convert-demo-context";

type Props = {
  showProgram?: boolean;
  showInventory?: boolean;
  showEvidence?: boolean;
  showVerifyLoop?: boolean;
  showMigrationDiagram?: boolean;
};

export function ConvertDemoProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ConvertDemoProvider>{children}</ConvertDemoProvider>;
}

export default function ConvertInteractiveBlock({
  showProgram = true,
  showInventory = true,
  showEvidence = false,
  showVerifyLoop = false,
  showMigrationDiagram = false,
}: Props) {
  return (
    <>
      {showProgram ? <ConvertProgramSimulator /> : null}
      {showInventory ? (
        <div className="mt-6">
          <ConvertInventoryEmbed />
        </div>
      ) : null}
      {showVerifyLoop ? (
        <div className="mt-6">
          <ConvertVerifyFixLoop />
        </div>
      ) : null}
      {showEvidence ? (
        <div className="mt-6">
          <ConvertEvidencePreview />
        </div>
      ) : null}
      {showMigrationDiagram ? (
        <div className="mt-6">
          <ConvertMigrationDiagram />
        </div>
      ) : null}
    </>
  );
}
