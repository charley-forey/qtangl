import AssessStartClient from "@/components/pqc/AssessStartClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/assess/start",
  title: "Start authorized Assess baseline",
  description: "Self-serve Assess signup — production tenant, authorized domains, dashboard history.",
});

export default function AssessStartPage() {
  return <AssessStartClient />;
}
