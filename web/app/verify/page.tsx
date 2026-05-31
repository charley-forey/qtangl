import { Suspense } from "react";

import VerifyPageClient from "./VerifyPageClient";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageClient />
    </Suspense>
  );
}
