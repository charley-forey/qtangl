"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { footerNav, nav, navCta } from "@/lib/siteConfig";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compressed, setCompressed] = useState(false);

  useEffect(() => {
    function onScroll() {
      setCompressed(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-black/80 backdrop-blur-md">
        <div
          className={[
            "mx-auto flex w-full max-w-[var(--container-wide)] items-center justify-between gap-3 px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12",
            compressed ? "py-3" : "py-3.5 sm:py-4",
          ].join(" ")}
        >
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-mark.svg"
              alt="Qtangl logo mark"
              width={32}
              height={32}
              priority
            />
            <div>
              <div className="text-label text-white">Qtangl</div>
              <div className="text-xs text-[var(--color-gray-400)]">
                Planning API for operational teams
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "text-white"
                      : "text-[var(--color-gray-300)] transition hover:text-white"
                  }
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={navCta.href}
              className="touch-target hidden items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.04] md:inline-flex"
            >
              {navCta.name}
            </Link>
            <button
              type="button"
              className="touch-target inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.04] md:hidden"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <Modal open={open} onClose={() => setOpen(false)} title="Qtangl navigation">
        <div className="space-y-5">
          <div className="space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`touch-target block rounded-xl border px-3 py-3 text-base transition ${
                  isActive(pathname, item.href)
                    ? "border-[var(--border-strong)] bg-white/[0.06] text-white"
                    : "border-transparent text-white hover:border-[var(--border)] hover:bg-white/[0.04]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hairline-divider" />
          <Link
            href={navCta.href}
            onClick={() => setOpen(false)}
            className="touch-target inline-flex w-full items-center justify-center rounded-full border border-[var(--border)] px-4 py-3 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
          >
            {navCta.name}
          </Link>
          <div className="hairline-divider" />
          <div className="space-y-2">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl border border-transparent px-3 py-3 text-sm text-[var(--color-gray-300)] transition hover:border-[var(--border)] hover:bg-white/[0.04] hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
