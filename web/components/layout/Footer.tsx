import Image from "next/image";
import Link from "next/link";

import { footerCopy, footerNav, nav } from "@/lib/copy/nav";
import { footerBlurb, footerContact, siteMetadata } from "@/lib/copy/product";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-black">
      <div className="mx-auto grid w-full max-w-[var(--container-wide)] gap-10 px-[var(--gutter-mobile)] py-14 md:px-[var(--gutter-tablet)] lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-[var(--gutter-desktop)] lg:py-16">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mark.svg"
              alt="Qtangl logo mark"
              width={32}
              height={32}
            />
            <div>
              <p className="brand-wordmark">{siteMetadata.name}</p>
              <p className="mt-1 text-sm text-[var(--color-gray-400)]">
                {siteMetadata.tagline}
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--color-gray-300)]">
            {footerBlurb}
          </p>
          <div className="mt-6 space-y-3 text-sm text-[var(--color-gray-300)]">
            <a
              href={`mailto:${siteMetadata.contactEmail}`}
              className="block transition hover:text-white"
            >
              {siteMetadata.contactEmail}
            </a>
            <p className="text-[var(--color-gray-400)]">{footerContact.location}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {footerContact.social.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-6 hairline-divider max-w-xl" />
        </div>

        <div className="space-y-4 text-sm text-[var(--color-gray-300)]">
          <p className="text-label">{footerCopy.primaryHeading}</p>
          <div className="space-y-3">
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
        </div>

        <div className="space-y-4 text-sm text-[var(--color-gray-300)]">
          <p className="text-label">{footerCopy.secondaryHeading}</p>
          <div className="space-y-3">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block transition hover:text-white"
              >
                {item.name}
              </Link>
            ))}
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
