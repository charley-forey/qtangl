"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import DashboardAppHeader from "@/components/dashboard/DashboardAppHeader";

export default function ConditionalSiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isDashboardApp =
    pathname.startsWith("/command-center") && !pathname.startsWith("/command-center/login");

  return (
    <div className="quantum-shell relative flex min-h-dvh flex-col overflow-x-hidden">
      {isDashboardApp ? <DashboardAppHeader /> : <Navbar />}
      <div className="relative flex flex-1 flex-col">{children}</div>
      {isDashboardApp ? null : <Footer />}
    </div>
  );
}
