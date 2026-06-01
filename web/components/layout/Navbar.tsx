"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { footerCopy, footerNav, nav, navbarCopy } from "@/lib/copy/nav";
import { navCta } from "@/lib/siteConfig";

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

const navLinkClass =
  "font-medium transition hover:text-white";
const primaryCtaBaseClass =
  "touch-target items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_14px_34px_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:bg-neutral-100 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_24px_50px_rgba(255,255,255,0.12)]";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compressed, setCompressed] = useState(() =>
    typeof window === "undefined" ? false : window.scrollY > 24
  );

  useEffect(() => {
    let frame = 0;
    let lastCompressed = window.scrollY > 24;

    function syncCompressedState() {
      frame = 0;

      const nextCompressed = window.scrollY > 24;
      if (nextCompressed !== lastCompressed) {
        lastCompressed = nextCompressed;
        setCompressed(nextCompressed);
      }
    }

    function onScroll() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(syncCompressedState);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <>
      <header className="header-shell header-hairline fixed inset-x-0 top-0 z-50">
        <div
          className={[
            "mx-auto flex w-full max-w-[var(--container-wide)] items-center justify-between gap-4 px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12",
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
            <div className="min-w-0">
              <div className="brand-wordmark">Qtangl</div>
              <Link
                href={navbarCopy.subtitleHref}
                className="mt-1 inline-block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-gray-300)] transition hover:text-white"
              >
                {navbarCopy.subtitle}
              </Link>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 text-sm lg:flex xl:gap-6">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    navLinkClass,
                    active ? "text-white" : "text-[var(--color-gray-300)]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={[
                      "relative inline-flex pb-1",
                      active
                        ? "after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-white/80"
                        : "",
                    ].join(" ")}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={navCta.href} className={`${primaryCtaBaseClass} hidden md:inline-flex`}>
              {navbarCopy.primaryCtaLabel}
            </Link>
            <button
              type="button"
              className="touch-target inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.02] text-white transition hover:border-[var(--border-strong)] hover:bg-white/[0.06] lg:hidden"
              onClick={() => setOpen(true)}
              aria-controls="mobile-navigation"
              aria-expanded={open}
              aria-label={navbarCopy.mobileMenuLabel}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>
      <div aria-hidden="true" className="h-16 sm:h-[4.5rem]" />

      <Modal open={open} onClose={() => setOpen(false)} title={navbarCopy.mobileTitle}>
        <div id="mobile-navigation" className="space-y-5">
          <div className="space-y-2">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`touch-target block rounded-xl border px-3 py-3 text-base transition ${
                    active
                      ? "border-[var(--border-strong)] bg-white/[0.06] text-white"
                      : "border-transparent text-white hover:border-[var(--border)] hover:bg-white/[0.04]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="hairline-divider" />
          <Link
            href={navCta.href}
            onClick={() => setOpen(false)}
            className={`${primaryCtaBaseClass} inline-flex w-full justify-center`}
          >
            {navbarCopy.primaryCtaLabel}
          </Link>
          <div className="hairline-divider" />
          <div className="space-y-2">
            <p className="px-3 text-xs uppercase tracking-[0.22em] text-[var(--color-gray-500)]">
              {footerCopy.secondaryHeading}
            </p>
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
