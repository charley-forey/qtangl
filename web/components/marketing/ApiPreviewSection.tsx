import Link from "next/link";

import CodeBlock from "@/components/docs/CodeBlock";
import Eyebrow from "@/components/ui/Eyebrow";
import { pqcPreviewRequest, pqcPreviewResponse } from "@/lib/copy/api-examples";
import { readinessHomeNarrative } from "@/lib/copy/readiness-home";

type ApiPreviewSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  request?: object;
  response?: object;
  docsHref?: string;
};

export default function ApiPreviewSection({
  eyebrow = readinessHomeNarrative.apiEyebrow,
  title = readinessHomeNarrative.apiTitle,
  description = readinessHomeNarrative.apiDescription,
  request = pqcPreviewRequest,
  response = pqcPreviewResponse,
  docsHref = "/docs/guides/pqc-demo",
}: ApiPreviewSectionProps) {
  return (
    <div className="min-w-0 w-full">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="heading-section mt-4">{title}</h2>
        <p className="mt-4 text-base leading-7 text-[var(--color-gray-300)]">
          {description}
        </p>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <CodeBlock title="Request" code={request} />
        <CodeBlock title="Response" code={response} />
      </div>

      <Link
        href={docsHref}
        className="mt-5 inline-block text-sm text-[var(--color-gray-400)] underline-offset-4 transition hover:text-white hover:underline"
      >
        PQC API guide →
      </Link>
    </div>
  );
}
