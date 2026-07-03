"use client";

import { ccFlags } from "@/lib/cc-feature-flags";

export { ccFlags };

/**
 * Feature flag for Command Center v2 redesign.
 * Default on; set NEXT_PUBLIC_QTANGL_CC_V2=false to use legacy chrome.
 */
export function useCommandCenterV2(): boolean {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_QTANGL_CC_V2 === "false") {
    return false;
  }
  return true;
}

export function commandCenterV2Enabled(): boolean {
  return process.env.NEXT_PUBLIC_QTANGL_CC_V2 !== "false";
}
