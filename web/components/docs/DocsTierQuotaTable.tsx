import type { DocsTierQuotaRow } from "@/lib/docs/rate-limits";

type DocsTierQuotaTableProps = {
  rows: readonly DocsTierQuotaRow[];
};

export default function DocsTierQuotaTable({ rows }: DocsTierQuotaTableProps) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)]">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="sticky top-0 bg-[var(--color-gray-950)]">
          <tr className="border-b border-[var(--border)] text-[var(--color-gray-400)]">
            <th className="px-4 py-3 font-medium">Tier</th>
            <th className="px-4 py-3 font-medium">Scans / month</th>
            <th className="px-4 py-3 font-medium">Schedules</th>
            <th className="px-4 py-3 font-medium">API keys</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.tier}
              className="border-b border-[var(--border)]/60 align-top last:border-0"
            >
              <td className="px-4 py-3 text-white">{row.tier}</td>
              <td className="px-4 py-3 font-mono text-[var(--color-gray-300)]">
                {row.maxScansPerMonth}
              </td>
              <td className="px-4 py-3 font-mono text-[var(--color-gray-300)]">
                {row.maxSchedules}
              </td>
              <td className="px-4 py-3 font-mono text-[var(--color-gray-300)]">
                {row.maxApiKeys}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
