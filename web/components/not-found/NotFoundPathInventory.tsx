"use client";

import Link from "next/link";

import StateTransition from "@/components/quantum/StateTransition";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { notFoundCopy } from "@/lib/copy/not-found";
import type { RouteSuggestion } from "@/lib/site-route-index";

type NotFoundPathInventoryProps = {
  pathname: string;
  suggestions: RouteSuggestion[];
  onSuggestionClick: (entry: RouteSuggestion) => void;
};

export default function NotFoundPathInventory({
  pathname,
  suggestions,
  onSuggestionClick,
}: NotFoundPathInventoryProps) {
  const copy = notFoundCopy.marketing.inventory;
  const displayPath = pathname || "/unknown";

  return (
    <StateTransition>
      <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--color-gray-500)]">
                <th className="pb-3 pr-4 font-medium">Route</th>
                <th className="pb-3 pr-4 font-medium">Algorithm</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]/70">
                <td className="py-4 pr-4">
                  <code className="font-mono text-white">{displayPath}</code>
                </td>
                <td className="py-4 pr-4 text-[var(--color-gray-400)]">{copy.algorithm}</td>
                <td className="py-4 pr-4">
                  <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-100">
                    {copy.status}
                  </span>
                </td>
                <td className="py-4 text-[var(--color-gray-400)]">
                  {suggestions[0] ? (
                    <Link
                      href={suggestions[0].href}
                      onClick={() => onSuggestionClick(suggestions[0]!)}
                      className="font-medium text-white underline underline-offset-4"
                    >
                      {suggestions[0].title}
                    </Link>
                  ) : (
                    copy.migrationLabel
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </StateTransition>
  );
}
