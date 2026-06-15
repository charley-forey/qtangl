"use client";

import { useCallback, useState } from "react";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

type AssessShareLinkButtonProps = {
  scanId: string;
  className?: string;
};

export default function AssessShareLinkButton({ scanId, className }: AssessShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/assess?scanId=${encodeURIComponent(scanId)}`
      : `/assess?scanId=${encodeURIComponent(scanId)}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackEvent("assess_share_link_copied", { scanId });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [scanId, shareUrl]);

  return (
    <div className={className}>
      <p className="font-mono text-xs text-[var(--color-gray-400)]">{shareUrl.replace(/^https?:\/\/[^/]+/, "")}</p>
      <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => void copyLink()}>
        {copied ? "Copied" : "Copy share link"}
      </Button>
    </div>
  );
}
