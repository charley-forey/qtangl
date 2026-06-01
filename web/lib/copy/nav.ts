export const nav = [
  { name: "Platform", href: "/platform" },
  { name: "Assess", href: "/assess" },
  { name: "Monitor", href: "/monitor" },
  { name: "Convert", href: "/convert" },
  { name: "Trust", href: "/trust" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Demo", href: "/demo/pqc" },
  { name: "Pricing", href: "/pricing" },
] as const;

export const navSecondary = [
  { name: "Docs", href: "/docs" },
  { name: "Access", href: "/access" },
] as const;

export const footerNav = [
  { name: "Journey", href: "/journey" },
  { name: "Resources", href: "/resources" },
  { name: "Mini-assessment", href: "/assess/mini" },
  { name: "Q-Day hub", href: "/q-day" },
  { name: "Solutions", href: "/solutions" },
  { name: "Partners", href: "/partners" },
  { name: "Status", href: "https://status.qtangl.com" },
  { name: "Verify", href: "/verify" },
  { name: "Labs (expansion)", href: "/labs" },
  { name: "Learn", href: "/learn" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
] as const;

export const navbarCopy = {
  subtitle: "Q-Day Readiness",
  subtitleHref: "/platform",
  primaryCtaLabel: "Run assessment",
  mobileMenuLabel: "Open menu",
  mobileTitle: "Qtangl navigation",
} as const;

export const footerCopy = {
  primaryHeading: "Platform",
  secondaryHeading: "More",
  contactLabel: "Contact",
} as const;
