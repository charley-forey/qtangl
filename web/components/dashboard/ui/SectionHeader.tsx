export default function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
      <div>
        <h2 className="text-label text-[var(--color-gray-500)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-gray-400)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
