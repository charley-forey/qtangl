import Link from "next/link";
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
  return (
    <main className="flex-1">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-12 lg:py-24">
        <aside className="h-fit">
          <Card className="rounded-2xl p-5">
            <Eyebrow>Docs</Eyebrow>
            <nav className="mt-5 space-y-2">
              {docsNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl border border-transparent px-3 py-2 text-sm text-[var(--color-gray-300)] transition hover:border-[var(--border)] hover:bg-white/[0.04] hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
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
