"use client";

type SourceRuntimeDiffProps = {
  sourceCount: number;
  runtimeCount: number;
  runtimeOnly: Array<string | { bomRef?: string; algorithm?: string; location?: string }>;
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
          {runtimeOnly.slice(0, 10).map((item, i) => (
            <li key={typeof item === "string" ? item : item.bomRef ?? `item-${i}`}>
              {typeof item === "string" ? item : item.bomRef ?? item.algorithm ?? item.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
