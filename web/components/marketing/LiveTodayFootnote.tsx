export default function LiveTodayFootnote({ features }: { features: string[] }) {
  if (!features.length) {
    return null;
  }
  return (
    <p className="mt-4 text-xs text-[var(--muted)]">
      <span className="font-medium text-white">Live today:</span> {features.join(" · ")}
    </p>
  );
}
