import { httpErrors } from "@/lib/docs/errors";
import type { DocsErrorRow } from "@/lib/docs/types";

type DocsErrorTableProps = {
  errors?: readonly DocsErrorRow[];
};

export default function DocsErrorTable({ errors = httpErrors }: DocsErrorTableProps) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="sticky top-0 bg-[var(--color-gray-950)]">
          <tr className="border-b border-[var(--border)] text-[var(--color-gray-400)]">
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Meaning</th>
            <th className="px-4 py-3 font-medium">Typical cause</th>
            <th className="px-4 py-3 font-medium">Suggested fix</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((row) => (
            <tr
              key={`${row.code}-${row.meaning}`}
              className="border-b border-[var(--border)]/60 align-top last:border-0"
            >
              <td className="px-4 py-3 font-mono text-white">
                {row.code > 0 ? row.code : "—"}
              </td>
              <td className="px-4 py-3 text-white">{row.meaning}</td>
              <td className="px-4 py-3 text-[var(--color-gray-300)]">{row.cause}</td>
              <td className="px-4 py-3 text-[var(--color-gray-300)]">{row.fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
