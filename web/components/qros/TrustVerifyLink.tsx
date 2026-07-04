import Link from "next/link";

type Props = {
  scanId?: string | null;
  label?: string;
  className?: string;
};

export default function TrustVerifyLink({ scanId, label = "Verify", className = "" }: Props) {
  if (!scanId) return null;
  return (
    <Link
      href={`/verify?scanId=${encodeURIComponent(scanId)}`}
      className={`inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200 ${className}`}
      title="Confirms report integrity and signing — not complete estate coverage"
    >
      <span aria-hidden>✓</span>
      {label}
    </Link>
  );
}
