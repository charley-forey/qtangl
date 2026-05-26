import Image from "next/image";
import Link from "next/link";

import { footerBlurb, siteMetadata } from "@/lib/copy/product";
import { footerNav, nav } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-black">
      <div className="mx-auto grid w-full max-w-[var(--container-wide)] gap-10 px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-tablet)] lg:grid-cols-[1.35fr_0.9fr] lg:px-[var(--gutter-desktop)]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mark.svg"
              alt="Qtangl logo mark"
              width={32}
              height={32}
            />
            <div>
              <p className="text-label text-white">{siteMetadata.name}</p>
              <p className="text-sm text-[var(--color-gray-400)]">
                {siteMetadata.tagline}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-gray-300)]">
            {footerBlurb}
          </p>
        </div>

        <div className="grid gap-6 text-sm text-[var(--color-gray-300)] sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-label">Primary</p>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block transition hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-label">Signal</p>
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block transition hover:text-white"
              >
                {item.name}
              </Link>
            ))}
            <a
              href={`mailto:${siteMetadata.contactEmail}`}
              className="block transition hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto w-full max-w-[var(--container-wide)] px-[var(--gutter-mobile)] py-4 text-center text-xs text-[var(--color-gray-500)] md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
          © {new Date().getFullYear()} Qtangl. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
