"use client";

import dynamic from "next/dynamic";

const HndlLeadCapture = dynamic(() => import("@/components/marketing/HndlLeadCapture"), {
  loading: () => <div className="h-32 animate-pulse rounded-[var(--radius-feature)] bg-white/5" />,
});

type HndlBlogLeadCaptureProps = {
  slug: string;
};

export default function HndlBlogLeadCapture({ slug }: HndlBlogLeadCaptureProps) {
  return <HndlLeadCapture source={`blog-${slug}`} />;
}
