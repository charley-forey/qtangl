import { statusPageHref } from "@/lib/siteConfig";

export const nav = [
  { name: "Platform", href: "/platform" },
  { name: "Assess", href: "/assess" },
  { name: "Monitor", href: "/monitor" },
  { name: "Convert", href: "/convert" },
  { name: "Pricing", href: "/pricing" },
  { name: "Docs", href: "/docs" },
] as const;

export const footerNav = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Assess start", href: "/assess/start" },
  { name: "Access", href: "/access" },
  { name: "Journey", href: "/journey" },
  { name: "Resources", href: "/resources" },
  { name: "Compare", href: "/compare" },
  { name: "Mini-assessment", href: "/assess/mini" },
  { name: "Q-Day hub", href: "/q-day" },
  { name: "Solutions", href: "/solutions" },
  { name: "Partners", href: "/partners" },
  { name: "Trust", href: "/trust" },
  { name: "Status", href: statusPageHref },
  { name: "Verify", href: "/verify" },
  { name: "Learn", href: "/learn" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
] as const;

export const navbarCopy = {
  subtitle: "Q-Day Readiness",
  subtitleHref: "/platform",
  primaryCtaLabel: "Run Q-Day scan",
  mobileMenuLabel: "Open menu",
  mobileTitle: "Qtangl navigation",
} as const;

export const legalNav = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Trust", href: "/trust" },
  { name: "Security", href: "/trust/security" },
  { name: "Sub-processors", href: "/trust/subprocessors" },
] as const;

export const footerCopy = {
  primaryHeading: "Platform",
  secondaryHeading: "More",
  legalHeading: "Legal",
} as const;
