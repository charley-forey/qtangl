"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { footerNav, nav } from "@/lib/siteConfig";

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
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-black/80 backdrop-blur-xl">
        <div
          className={[
            "mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-12",
            compressed ? "py-3" : "py-4",
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
                Quantum-native optimization interface
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
              href="/access"
              className="hidden rounded-full border border-[var(--border)] px-4 py-2 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.04] md:inline-flex"
            >
              Request Access
            </Link>
            <button
              type="button"
              className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.04] md:hidden"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <Modal open={open} onClose={() => setOpen(false)} title="Quantum navigation">
        <div className="space-y-5">
          <div className="space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl border border-transparent px-3 py-3 text-base text-white transition hover:border-[var(--border)] hover:bg-white/[0.04]"
              >
                {item.name}
              </Link>
            ))}
          </div>
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
