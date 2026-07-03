import type { ReactNode } from "react";

import ServiceWorkerRegistrar from "@/components/dashboard/ServiceWorkerRegistrar";

export default function CommandCenterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorkerRegistrar />
      {children}
    </>
  );
}
