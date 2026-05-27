export const nav = [
  { name: "Home", href: "/" },
  { name: "Try", href: "/try" },
  { name: "Demo", href: "/demo/hospital" },
  { name: "Learn", href: "/learn" },
  { name: "Technology", href: "/technology" },
  { name: "Docs", href: "/docs" },
  { name: "Access", href: "/access" },
] as const;

export const footerNav = [
  { name: "About", href: "/about" },
  { name: "API", href: "/api" },
  { name: "Blog", href: "/blog" },
  { name: "Learn", href: "/learn" },
] as const;

export const navbarCopy = {
  subtitle: "Quantum-aware planning API",
  primaryCtaLabel: "Collapse a plan",
  mobileMenuLabel: "Menu",
  mobileTitle: "Qtangl navigation",
} as const;

export const footerCopy = {
  primaryHeading: "Explore",
  secondaryHeading: "More",
  contactLabel: "Contact",
} as const;
