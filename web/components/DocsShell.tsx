import Link from "next/link";
import { ReactNode } from "react";

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
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-12 lg:py-20">
        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Docs
          </p>
          <nav className="mt-5 space-y-2">
            {docsNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Developer portal
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            {description}
          </p>
          <div className="mt-10 space-y-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
