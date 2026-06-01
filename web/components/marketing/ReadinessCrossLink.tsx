import Link from "next/link";

type ReadinessCrossLinkProps = {
  text?: string;
  href?: string;
  cta?: string;
};

export default function ReadinessCrossLink({
  text = "Looking for post-quantum readiness?",
  href = "/platform",
  cta = "Explore platform →",
}: ReadinessCrossLinkProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/[0.03] px-5 py-4 sm:px-6">
      <p className="text-sm text-[var(--color-gray-300)]">
        {text}{" "}
        <Link href={href} className="font-medium text-white underline-offset-4 hover:underline">
          {cta}
        </Link>
      </p>
    </div>
  );
}
