"use client";

import type { CSSProperties, ReactNode } from "react";

type PortalBranding = {
  headerText?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  partnerDisplayName?: string;
};

function portalBrandingFromSettings(settings: Record<string, unknown> | null | undefined): PortalBranding {
  const raw = settings?.portalBranding;
  if (!raw || typeof raw !== "object") {
    return {};
  }
  return raw as PortalBranding;
}

export default function DashboardBrandingProvider({
  tenantSettings,
  children,
}: {
  tenantSettings?: Record<string, unknown> | null;
  children: ReactNode;
}) {
  const portal = portalBrandingFromSettings(tenantSettings);
  const accent = portal.accentColor?.trim() || portal.primaryColor?.trim();
  const style = {
    ...(accent
      ? {
          "--accent": accent,
          "--color-accent": accent,
        }
      : {}),
    ...(portal.primaryColor?.trim() ? { "--brand-primary": portal.primaryColor.trim() } : {}),
    ...(portal.logoUrl?.trim() ? { "--brand-logo-url": `url("${portal.logoUrl.trim()}")` } : {}),
  } as CSSProperties;

  const headerLabel = portal.headerText?.trim() || portal.partnerDisplayName?.trim();

  return (
    <div style={style} data-brand-header={headerLabel || undefined}>
      {children}
    </div>
  );
}
