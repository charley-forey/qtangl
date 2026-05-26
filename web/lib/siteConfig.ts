export { footerNav, nav } from "@/lib/copy/nav";

export const navCta = { name: "Try the planner", href: "/try" } as const;

export const docsNav = [
  { name: "Overview", href: "/docs" },
  { name: "Data formats", href: "/docs/data-formats" },
  { name: "Quickstart", href: "/docs/quickstart" },
  { name: "Concepts", href: "/docs/concepts" },
  { name: "API Guide", href: "/docs/api" },
] as const;
