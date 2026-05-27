"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

import DocsBreadcrumbs from "@/components/docs/DocsBreadcrumbs";
import DocsPager from "@/components/docs/DocsPager";
import DocsSearch from "@/components/docs/DocsSearch";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsToc, { DocsTocMobile } from "@/components/docs/DocsToc";
import Modal from "@/components/ui/Modal";
import Eyebrow from "@/components/ui/Eyebrow";
import { DocsProvider } from "@/lib/docs/context";
import type { DocsSearchEntry } from "@/lib/docs/types";

type DocsShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  pathname?: string;
  searchIndex?: DocsSearchEntry[];
};

export default function DocsShell({
  title,
  description,
  children,
  pathname: pathnameProp,
  searchIndex = [],
}: DocsShellProps) {
  const pathnameHook = usePathname();
  const pathname = pathnameProp ?? pathnameHook;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <DocsProvider pathname={pathname}>
      <main className="docs-layout flex-1 print:block">
        <div className="mx-auto grid w-full max-w-[var(--container-wide)] gap-8 px-5 py-10 sm:px-6 md:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-16 xl:grid-cols-[280px_minmax(0,1fr)_220px] xl:px-12">
          <aside className="docs-sidebar-col print:hidden lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="space-y-4 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="touch-target w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-white"
              >
                Docs menu
              </button>
              {searchIndex.length > 0 ? <DocsSearch index={searchIndex} /> : null}
            </div>
            <div className="hidden lg:block">
              {searchIndex.length > 0 ? (
                <div className="mb-6">
                  <DocsSearch index={searchIndex} />
                </div>
              ) : null}
              <DocsSidebar />
            </div>
          </aside>

          <section className="docs-main min-w-0">
            <DocsBreadcrumbs pathname={pathname} />
            <Eyebrow className="mt-4">Developer portal</Eyebrow>
            <h1 className="heading-display gradient-text mt-4 max-w-4xl">{title}</h1>
            <p className="text-body-lg mt-5 max-w-3xl text-[var(--color-gray-300)]">
              {description}
            </p>
            <DocsTocMobile />
            <div className="docs-content mt-10 space-y-8">{children}</div>
            <DocsPager pathname={pathname} />
            <p className="docs-edit-link mt-8 text-xs text-[var(--color-gray-600)] print:hidden">
              Found an issue?{" "}
              <a
                href="https://github.com/qtangl/qtangl/issues"
                className="text-[var(--color-gray-400)] underline underline-offset-2 hover:text-white"
                rel="noopener noreferrer"
                target="_blank"
              >
                Report documentation feedback
              </a>
            </p>
          </section>

          <aside className="docs-toc-col print:hidden">
            <div className="sticky top-24">
              <DocsToc />
            </div>
          </aside>
        </div>
      </main>

      <Modal open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="Documentation">
        <div className="max-h-[70vh] overflow-y-auto">
          <DocsSidebar onNavigate={() => setMobileNavOpen(false)} />
        </div>
      </Modal>
    </DocsProvider>
  );
}
