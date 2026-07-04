import type { Metadata } from "next";

import LiveStatusWall from "@/components/demo/LiveStatusWall";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/live/status",
  title: "Live Crypto Range — Status Wall",
  description:
    "Shareable live status wall with readiness trend, topology, compliance scorecard, signed evidence, and alert feed.",
});

export default function LiveDemoStatusPage() {
  return <LiveStatusWall />;
}
