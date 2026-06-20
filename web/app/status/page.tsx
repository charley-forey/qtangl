import StatusPageClient, { type DogfoodState } from "@/components/status/StatusPageClient";
import { fetchDogfoodSummary } from "@/lib/dogfood";
import { getPlatformStatus, platformStatusCopy } from "@/lib/status";

export const metadata = platformStatusCopy.metadata;
export const dynamic = "force-dynamic";

function resolveDogfoodState(): Promise<DogfoodState> {
  return fetchDogfoodSummary().then((summary) => {
    if (!summary?.latest) return "unavailable";
    if (summary.freshness?.allFresh === false) return "stale";
    return "operational";
  });
}

export default async function StatusPage() {
  const [snapshot, dogfood] = await Promise.all([getPlatformStatus(), resolveDogfoodState()]);
  return <StatusPageClient snapshot={snapshot} dogfood={dogfood} />;
}
