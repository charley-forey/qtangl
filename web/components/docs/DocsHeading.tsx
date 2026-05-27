"use client";

import { useEffect, type ReactNode } from "react";

import { slugifyHeading, useDocsContext } from "@/lib/docs/context";

type DocsHeadingProps = {
  level?: 2 | 3;
  id?: string;
  children: ReactNode;
  className?: string;
};

export default function DocsHeading({
  level = 2,
  id,
  children,
  className = "",
}: DocsHeadingProps) {
  const { registerHeading } = useDocsContext();
  const text = typeof children === "string" ? children : String(children);
  const slug = id ?? slugifyHeading(text);

  useEffect(() => {
    registerHeading({ id: slug, title: text, level });
  }, [registerHeading, slug, text, level]);

  const Tag = level === 2 ? "h2" : "h3";
  const sizeClass =
    level === 2
      ? "text-2xl font-semibold text-white"
      : "text-lg font-semibold text-white";

  async function copyAnchor() {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.location.hash = slug;
    }
  }

  return (
    <Tag
      id={slug}
      className={[
        "docs-heading group scroll-mt-28 flex items-center gap-2",
        sizeClass,
        className,
      ].join(" ")}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <button
        type="button"
        onClick={copyAnchor}
        className="shrink-0 rounded-md border border-transparent px-2 py-1 font-mono text-xs text-[var(--color-gray-500)] opacity-0 transition group-hover:opacity-100 hover:border-[var(--border)] hover:text-white focus:opacity-100"
        aria-label={`Copy link to ${text}`}
      >
        #
      </button>
    </Tag>
  );
}
