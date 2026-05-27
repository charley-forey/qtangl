import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { DemoCatalogEntry } from "@/lib/copy/demos";

type DemoCatalogCardProps = {
  demo: DemoCatalogEntry;
};

export default function DemoCatalogCard({ demo }: DemoCatalogCardProps) {
  const isSandbox = demo.variant === "sandbox";
  const isLive = demo.status === "live" && demo.href;
  const isInteractive = isSandbox || isLive;

  const card = (
    <Card
      tone={isSandbox ? "strong" : isLive ? "feature" : "strong"}
      size="lg"
      interactive={Boolean(isInteractive && demo.href)}
      className={[
        "h-full rounded-[var(--radius-feature)]",
        isSandbox
          ? "border border-dashed border-[var(--border-strong)] border-l-4 border-l-white/40"
          : "",
        !isInteractive ? "opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <Eyebrow>{demo.sector}</Eyebrow>
        <span
          className={[
            "text-label",
            isSandbox ? "font-mono text-white/90" : "text-white/70",
          ].join(" ")}
        >
          {isSandbox ? demo.badge ?? "Interactive" : demo.status === "live" ? "Live" : "Coming soon"}
        </span>
      </div>
      {isSandbox ? (
        <p className="mt-3 font-mono text-xs tracking-wide text-[var(--color-gray-400)]">
          {demo.endpoint ?? "POST /optimize"}
        </p>
      ) : null}
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">{demo.title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{demo.oneLiner}</p>
      {demo.runtime ? (
        <p className="mt-4 text-label text-white">{demo.runtime} walkthrough</p>
      ) : null}
      {isInteractive && demo.href ? (
        <p className="mt-6 text-sm font-medium text-white">
          {isSandbox ? "Open sandbox →" : "Open demo →"}
        </p>
      ) : null}
    </Card>
  );

  if (isInteractive && demo.href) {
    return (
      <Link href={demo.href} className="block focus-visible:outline-none">
        {card}
      </Link>
    );
  }

  return card;
}
