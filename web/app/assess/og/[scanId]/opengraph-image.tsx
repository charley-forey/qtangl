import { pollPqcScan } from "@/lib/pqc";
import {
  readinessOgContentType,
  readinessOgSize,
  renderReadinessOgImage,
} from "@/lib/readiness-og-image";

export const size = readinessOgSize;
export const contentType = readinessOgContentType;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;
  let score = "—";
  let band = "Baseline";
  let target = scanId;

  try {
    const result = await pollPqcScan(scanId);
    if (result.status === "success") {
      score = String(result.scoreboard.qtangl.readiness_score ?? "—");
      band = result.scoreboard.qtangl.readiness_band ?? band;
      target = result.scenario?.target?.domain ?? result.scenario?.title ?? scanId;
    }
  } catch {
    // Fall back to static OG content when scan is unavailable.
  }

  return renderReadinessOgImage({
    eyebrow: "Shared Q-Day assessment",
    title: `Readiness score: ${score}`,
    description: `${band} · ${target}. Verify signing integrity at qtangl.com/verify — inventory aid, not formal attestation.`,
    footer: scanId,
  });
}
