import type { DocsFieldRow } from "@/lib/docs/types";

type DocsFieldTableProps = {
  fields: readonly DocsFieldRow[];
  title?: string;
};

export default function DocsFieldTable({ fields, title }: DocsFieldTableProps) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)]">
      {title ? (
        <p className="border-b border-[var(--border)] px-4 py-3 text-label">{title}</p>
      ) : null}
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="sticky top-0 bg-[var(--color-gray-950)]">
          <tr className="border-b border-[var(--border)] text-[var(--color-gray-400)]">
            <th className="px-4 py-3 font-medium">Field</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Required</th>
            <th className="px-4 py-3 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr
              key={field.name}
              id={field.name.replace(/[[\].]/g, "-")}
              className="border-b border-[var(--border)]/60 align-top last:border-0"
            >
              <td className="px-4 py-3 font-mono text-xs text-white">{field.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--color-gray-300)]">
                {field.type}
              </td>
              <td className="px-4 py-3 text-[var(--color-gray-400)]">
                {field.required ? "Yes" : field.default ? `No (${field.default})` : "No"}
              </td>
              <td className="px-4 py-3 text-[var(--color-gray-300)]">
                <p>{field.description}</p>
                {field.example ? (
                  <p className="mt-2 font-mono text-xs text-[var(--color-gray-500)]">
                    e.g. {field.example}
                  </p>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
