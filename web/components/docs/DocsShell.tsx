"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { docsNav } from "@/lib/siteConfig";

type DocsShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function DocsShell({
  title,
  description,
  children,
}: DocsShellProps) {
  const pathname = usePathname();

  return (
    <main className="flex-1">
      <div className="mx-auto grid w-full max-w-[var(--container-wide)] gap-8 px-5 py-14 sm:px-6 sm:py-16 md:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-20 xl:px-12 xl:py-24">
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="lg:hidden">
            <Eyebrow>Docs</Eyebrow>
            <nav className="mobile-scroll-nav mt-4">
              {docsNav.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "touch-target inline-flex items-center whitespace-nowrap rounded-full border px-4 text-sm transition",
                      active
                        ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
                        : "border-[var(--border)] text-[var(--color-gray-300)] hover:border-[var(--border-strong)] hover:text-white",
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Card className="hidden rounded-2xl p-5 lg:block">
            <Eyebrow>Docs</Eyebrow>
            <nav className="mt-5 space-y-2">
              {docsNav.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "block rounded-xl border px-3 py-3 text-sm transition",
                      active
                        ? "border-[var(--border-strong)] bg-white/[0.06] text-white"
                        : "border-transparent text-[var(--color-gray-300)] hover:border-[var(--border)] hover:bg-white/[0.04] hover:text-white",
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        <section className="min-w-0">
          <Eyebrow>Developer portal</Eyebrow>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-gray-300)]">
            {description}
          </p>
          <div className="mt-10 space-y-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
