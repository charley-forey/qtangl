import type { DocsEndpointLimitRow } from "@/lib/docs/rate-limits";

type DocsEndpointLimitTableProps = {
  rows: readonly DocsEndpointLimitRow[];
  showCountsColumn?: boolean;
};

export default function DocsEndpointLimitTable({
  rows,
  showCountsColumn = true,
}: DocsEndpointLimitTableProps) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="sticky top-0 bg-[var(--color-gray-950)]">
          <tr className="border-b border-[var(--border)] text-[var(--color-gray-400)]">
            <th className="px-4 py-3 font-medium">Method</th>
            <th className="px-4 py-3 font-medium">Path</th>
            {showCountsColumn ? (
              <th className="px-4 py-3 font-medium">Counts toward 300/min</th>
            ) : null}
            <th className="px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.method}-${row.path}`}
              className="border-b border-[var(--border)]/60 align-top last:border-0"
            >
              <td className="px-4 py-3 font-mono text-white">{row.method}</td>
              <td className="px-4 py-3 font-mono text-white">{row.path}</td>
              {showCountsColumn ? (
                <td className="px-4 py-3 text-[var(--color-gray-300)]">
                  {row.countsTowardLimit ? "Yes" : "No"}
                </td>
              ) : null}
              <td className="px-4 py-3 text-[var(--color-gray-300)]">{row.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
