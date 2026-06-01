import Link from "next/link";

export default function ProductModeBanner({
  mode = "preview",
}: {
  mode?: "live" | "preview";
}) {
  if (mode === "live") {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100">
        <span className="font-medium">Live in product</span> — connect your tenant key on{" "}
        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>{" "}
        or run a scan on{" "}
        <Link href="/demo/pqc" className="underline">
          Demo
        </Link>
        .
      </p>
    );
  }
  return (
    <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
      <span className="font-medium">Illustrative preview</span> — not your live data. See{" "}
      <Link href="/dashboard" className="underline">
        Dashboard
      </Link>{" "}
      for schedules, alerts, and remediation with your API key.
    </p>
  );
}
