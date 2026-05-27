import Link from "next/link";

import { getBreadcrumbs } from "@/lib/docs/nav";

type DocsBreadcrumbsProps = {
  pathname: string;
};

export default function DocsBreadcrumbs({ pathname }: DocsBreadcrumbsProps) {
  const crumbs = getBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="docs-breadcrumbs text-sm text-[var(--color-gray-500)]">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {isLast ? (
                <span className="text-[var(--color-gray-300)]">{crumb.name}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="transition hover:text-white"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
