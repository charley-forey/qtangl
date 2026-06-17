"use client";

import Image from "next/image";
import Link from "next/link";

import NavbarAccountMenu from "@/components/dashboard/NavbarAccountMenu";

/** Slim app header for signed-in dashboard routes (no marketing nav). */
export default function DashboardAppHeader() {
  return (
    <>
      <header className="header-shell header-hairline fixed inset-x-0 top-0 z-50 bg-black/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[var(--container-wide)] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo-mark.svg" alt="Qtangl" width={28} height={28} />
            <span className="brand-wordmark text-sm">Qtangl</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/docs/guides/monitor-workflow"
              className="hidden text-xs text-[var(--color-gray-400)] hover:text-white sm:inline"
            >
              Help
            </Link>
            <NavbarAccountMenu />
          </div>
        </div>
      </header>
      <div aria-hidden className="h-14 sm:h-[3.75rem]" />
    </>
  );
}
