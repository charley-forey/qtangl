import type { Metadata } from "next";
import { Suspense } from "react";

import VerifyPageClient from "./VerifyPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/verify",
  title: "Verify signed report",
  description: "Public verification of Qtangl PQC readiness report signatures and content hashes.",
});

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageClient />
    </Suspense>
  );
}
