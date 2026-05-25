import Image from "next/image";
import Link from "next/link";

import { footerBlurb, siteMetadata } from "@/lib/constants";
import { nav } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[1.4fr_0.8fr] lg:px-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <Image
              src="/qtangl_logo.png"
              alt="Qtangl logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                {siteMetadata.name}
              </p>
              <p className="text-sm text-slate-400">{siteMetadata.tagline}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{footerBlurb}</p>
        </div>

        <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.name}
            </Link>
          ))}
          <a
            href={`mailto:${siteMetadata.contactEmail}`}
            className="transition hover:text-white"
          >
            Contact
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-500 sm:px-8 lg:px-12">
        © {new Date().getFullYear()} Qtangl. Built for enterprise optimization teams.
      </div>
    </footer>
  );
}
