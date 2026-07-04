import type { Metadata } from "next";

import LiveControlPanel from "@/components/demo/LiveControlPanel";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/demo/live",
  title: "Live Crypto Range — Control Panel",
  description:
    "Control enterprise demo crypto resources, flip posture and compliance, orchestrate scenes, and drive the live status wall.",
});

export default function LiveDemoControlPage() {
  return (
    <PageShell>
      <Section>
        <LiveControlPanel />
      </Section>
    </PageShell>
  );
}
