"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { trackEvent } from "@/lib/analytics";

type HndlTrackedLinkProps = ComponentProps<typeof Link> & {
  placement: string;
  audience?: string;
};

export default function HndlTrackedLink({
  placement,
  audience,
  onClick,
  href,
  ...rest
}: HndlTrackedLinkProps) {
  return (
    <Link
      href={href}
      {...rest}
      onClick={(event) => {
        trackEvent("hndl_cta_click", {
          destination: typeof href === "string" ? href : href.toString(),
          placement,
          ...(audience ? { audience } : {}),
        });
        onClick?.(event);
      }}
    />
  );
}
