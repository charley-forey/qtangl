import { apiPreviewRequest, apiPreviewResponse } from "@/lib/copy/api-examples";
import { jsonContractCopy } from "@/lib/copy/visualization";
import { jsonContractCallouts } from "@/lib/copy/technology-deep";

type JsonContractProps = {
  className?: string;
};

function formatJson(value: object) {
  return JSON.stringify(value, null, 2);
}

function AnnotatedBlock({
  title,
  json,
  callouts,
}: {
  title: string;
  json: string;
  callouts: readonly { line: number; label: string; detail: string }[];
}) {
  const lines = json.split("\n");

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <pre className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/55 p-4 font-mono text-xs leading-6 text-[var(--color-gray-300)]">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const callout = callouts.find((item) => item.line === lineNumber);

            return (
              <div
                key={`${title}-${lineNumber}`}
                className={callout ? "bg-white/[0.04] -mx-4 px-4" : undefined}
              >
                <code>
                  <span className="mr-4 inline-block w-6 select-none text-[var(--color-gray-600)]">
                    {lineNumber}
                  </span>
                  {line}
                </code>
              </div>
            );
          })}
        </pre>
        <ul className="space-y-3 lg:min-w-[12rem]">
          {callouts.map((item) => (
            <li
              key={`${title}-${item.label}`}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.03] px-3 py-2"
            >
              <p className="font-mono text-xs text-white">{item.label}</p>
              <p className="mt-1 text-xs leading-6 text-[var(--color-gray-500)]">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function JsonContract({ className = "" }: JsonContractProps) {
  const requestJson = formatJson(apiPreviewRequest);
  const responseJson = formatJson(apiPreviewResponse);

  return (
    <section
      aria-label={jsonContractCopy.title}
      className={[
        "rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/35 p-5 lg:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{jsonContractCopy.eyebrow}</p>
      <h2 className="heading-section mt-4 !text-2xl">{jsonContractCopy.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-gray-300)]">
        {jsonContractCopy.description}
      </p>

      <div className="mt-8 grid gap-10 xl:grid-cols-2">
        <AnnotatedBlock
          title="Request"
          json={requestJson}
          callouts={jsonContractCallouts.request}
        />
        <AnnotatedBlock
          title="Response"
          json={responseJson}
          callouts={jsonContractCallouts.response}
        />
      </div>
    </section>
  );
}
