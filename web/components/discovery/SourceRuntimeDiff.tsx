"use client";

type SourceRuntimeDiffProps = {
  sourceCount: number;
  runtimeCount: number;
  runtimeOnly: string[];
};

export default function SourceRuntimeDiff({
  sourceCount,
  runtimeCount,
  runtimeOnly,
}: SourceRuntimeDiffProps) {
  const delta = runtimeCount - sourceCount;
  return (
    <div className="space-y-3 text-sm">
      <p>
        Source CBOM: <strong>{sourceCount}</strong> · Runtime/image CBOM: <strong>{runtimeCount}</strong>
        {delta > 0 && (
          <span className="ml-2 text-amber-400">({delta} runtime-only)</span>
        )}
      </p>
      {runtimeOnly.length > 0 && (
        <ul className="list-disc pl-5 text-[var(--muted)]">
          {runtimeOnly.slice(0, 10).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
