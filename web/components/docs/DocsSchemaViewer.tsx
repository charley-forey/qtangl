"use client";

import { useState, type ReactNode } from "react";

type JsonSchema = Record<string, unknown>;

type DocsSchemaViewerProps = {
  schema: JsonSchema;
  title?: string;
};

function SchemaNode({
  name,
  schema,
  depth = 0,
}: {
  name: string;
  schema: JsonSchema;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const type = schema.type as string | string[] | undefined;
  const properties = schema.properties as Record<string, JsonSchema> | undefined;
  const items = schema.items as JsonSchema | undefined;
  const enumValues = schema.enum as unknown[] | undefined;
  const required = schema.required as string[] | undefined;

  const typeLabel = Array.isArray(type) ? type.join(" | ") : type ?? "any";
  const hasChildren = Boolean(properties || items);

  return (
    <div className="border-l border-[var(--border)]/60 pl-3" style={{ marginLeft: depth * 4 }}>
      <div className="flex flex-wrap items-center gap-2 py-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="font-mono text-xs text-white hover:underline"
          >
            {open ? "−" : "+"} {name}
          </button>
        ) : (
          <span className="font-mono text-xs text-white">{name}</span>
        )}
        <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[0.65rem] text-[var(--color-gray-400)]">
          {typeLabel}
        </span>
        {enumValues ? (
          <span className="text-xs text-[var(--color-gray-500)]">
            enum: {enumValues.map(String).join(", ")}
          </span>
        ) : null}
        {schema.description ? (
          <span className="text-xs text-[var(--color-gray-500)]">
            {String(schema.description)}
          </span>
        ) : null}
      </div>
      {open && properties
        ? Object.entries(properties).map(([key, child]) => (
            <SchemaNode
              key={key}
              name={`${key}${required?.includes(key) ? " *" : ""}`}
              schema={child}
              depth={depth + 1}
            />
          ))
        : null}
      {open && items ? <SchemaNode name="items" schema={items} depth={depth + 1} /> : null}
    </div>
  );
}

export default function DocsSchemaViewer({ schema, title = "Schema" }: DocsSchemaViewerProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-black/40 p-4">
      <p className="text-label">{title}</p>
      <div className="mt-4 max-h-[28rem] overflow-auto">
        <SchemaNode name="root" schema={schema} />
      </div>
    </div>
  );
}

export function DocsSchemaSection({
  id,
  title,
  schema,
}: {
  id: string;
  title: string;
  schema: JsonSchema;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <DocsSchemaViewer schema={schema} title={title} />
    </section>
  );
}
