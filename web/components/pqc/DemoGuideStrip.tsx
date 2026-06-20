import { assessIntentCopy } from "@/lib/copy/readiness-assess-intent";

type DemoGuideStripProps = {
  intent?: "sample" | "live-demo";
};

export default function DemoGuideStrip({ intent = "sample" }: DemoGuideStripProps) {
  const banner =
    intent === "live-demo" ? assessIntentCopy.liveDemoBanner : assessIntentCopy.sampleBanner;

  return (
    <div className="rounded-lg border border-sky-500/20 bg-sky-950/30 px-4 py-3">
      <p className="text-xs leading-6 text-sky-100">{banner}</p>
      <p className="mt-2 text-[11px] leading-5 text-[var(--color-gray-500)]">
        Review Mosca HNDL risk → prove PQ handshake → export CBOM / signed PDF with verify link.
      </p>
    </div>
  );
}
