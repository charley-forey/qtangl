"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Eyebrow from "@/components/ui/Eyebrow";

const NAV = [
  { href: "/ops", label: "Overview", exact: true },
  { href: "/ops/tenants", label: "Tenants" },
  { href: "/ops/users", label: "Users" },
  { href: "/ops/funnel", label: "Funnel" },
  { href: "/ops/dogfood", label: "Dogfood" },
];

export default function OpsShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-gray-950)] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row">
        <aside className="lg:w-52 lg:shrink-0">
          <Eyebrow>Qtangl ops</Eyebrow>
          <nav className="mt-4 space-y-1 text-sm">
            {NAV.map((item) => {
              const active =
                item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 ${
                    active ? "bg-white/10 text-white" : "text-[var(--color-gray-400)] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/command-center" className="mt-6 block text-xs text-[var(--color-gray-500)] underline">
            Back to dashboard
          </Link>
        </aside>
        <main className="min-w-0 flex-1 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-[var(--color-gray-400)]">{subtitle}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
