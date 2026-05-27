export const nav = [
  { name: "Home", href: "/" },
  { name: "Demo", href: "/demo" },
  { name: "Technology", href: "/technology" },
  { name: "Docs", href: "/docs" },
  { name: "Learn", href: "/learn" },
  { name: "Access", href: "/access" },
] as const;

export const footerNav = [
  { name: "About", href: "/about" },
  { name: "API", href: "/api" },
  { name: "Sandbox", href: "/sandbox" },
  { name: "Blog", href: "/blog" },
  { name: "Learn", href: "/learn" },
] as const;

export const navbarCopy = {
  subtitle: "Quantum Planning API",
  subtitleHref: "/docs/api",
  primaryCtaLabel: "Find Quantum",
  mobileMenuLabel: "Open menu",
  mobileTitle: "Qtangl navigation",
} as const;

export const footerCopy = {
  primaryHeading: "Explore",
  secondaryHeading: "More",
  contactLabel: "Contact",
} as const;
