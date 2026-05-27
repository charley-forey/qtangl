import Link from "next/link";

import { getDocsPager } from "@/lib/docs/nav";

type DocsPagerProps = {
  pathname: string;
};

export default function DocsPager({ pathname }: DocsPagerProps) {
  const { prev, next } = getDocsPager(pathname);

  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Documentation pagination"
      className="docs-pager mt-12 grid gap-4 border-t border-[var(--border)] pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="rounded-2xl border border-[var(--border)] bg-black/30 p-4 transition hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
        >
          <p className="text-label">Previous</p>
          <p className="mt-2 text-sm font-medium text-white">{prev.name}</p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="rounded-2xl border border-[var(--border)] bg-black/30 p-4 text-right transition hover:border-[var(--border-strong)] hover:bg-white/[0.04] sm:col-start-2"
        >
          <p className="text-label">Next</p>
          <p className="mt-2 text-sm font-medium text-white">{next.name}</p>
        </Link>
      ) : null}
    </nav>
  );
}
