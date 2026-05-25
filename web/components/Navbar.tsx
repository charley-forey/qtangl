import Image from "next/image";
import Link from "next/link";

import { nav } from "@/lib/siteConfig";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/qtangl_logo.png"
            alt="Qtangl logo"
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Qtangl
            </div>
            <div className="text-xs text-slate-400">
              Quantum optimization API
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/#request-access"
          className="inline-flex items-center rounded-full border border-cyan-400/30 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:text-white"
        >
          Request Access
        </Link>
      </div>
    </header>
  );
}
