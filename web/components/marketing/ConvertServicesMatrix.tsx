import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { convertServicesMatrix } from "@/lib/copy/readiness-convert";

export default function ConvertServicesMatrix() {
  const { eyebrow, title, columns, rows } = convertServicesMatrix;

  return (
    <div>
      <div className="content-reading">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="heading-section mt-4">{title}</h2>
      </div>
      <Card tone="panel" className="mt-8 overflow-x-auto rounded-[var(--radius-xl)]">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              <th className="px-4 py-3">Capability</th>
              <th className="px-4 py-3">{columns[0]}</th>
              <th className="px-4 py-3">{columns[1]}</th>
            </tr>
          </thead>
          <tbody className="text-[var(--color-gray-300)]">
            {rows.map((row) => (
              <tr key={row.feature} className="border-b border-[var(--border-subtle)]">
                <td className="px-4 py-3 font-medium text-white">{row.feature}</td>
                <td className="px-4 py-3">{row.product ? "✓" : "—"}</td>
                <td className="px-4 py-3">
                  {row.services === "roadmap" ? "Roadmap" : row.services ? "✓" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
