import type { DocsRateLimitRow } from "@/lib/docs/rate-limits";

type DocsRateLimitTableProps = {
  rows: readonly DocsRateLimitRow[];
};

function statusLabel(status: DocsRateLimitRow["httpStatus"]): string {
  if (status === "429") return "429";
  if (status === "402") return "402";
  return "Policy";
}

export default function DocsRateLimitTable({ rows }: DocsRateLimitTableProps) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="sticky top-0 bg-[var(--color-gray-950)]">
          <tr className="border-b border-[var(--border)] text-[var(--color-gray-400)]">
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Limit</th>
            <th className="px-4 py-3 font-medium">Scope</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.category}-${row.limit}`}
              className="border-b border-[var(--border)]/60 align-top last:border-0"
            >
              <td className="px-4 py-3 text-white">
                {row.envVar ? (
                  <span>
                    {row.category}
                    <br />
                    <code className="mt-1 inline-block font-mono text-xs text-[var(--color-gray-400)]">
                      {row.envVar}
                    </code>
                  </span>
                ) : (
                  row.category
                )}
              </td>
              <td className="px-4 py-3 font-mono text-white">{row.limit}</td>
              <td className="px-4 py-3 text-[var(--color-gray-300)]">{row.scope}</td>
              <td className="px-4 py-3 font-mono text-[var(--color-gray-300)]">
                {statusLabel(row.httpStatus)}
              </td>
              <td className="px-4 py-3 text-[var(--color-gray-300)]">{row.notes ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
