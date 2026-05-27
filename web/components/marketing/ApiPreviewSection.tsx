import Link from "next/link";

import CodeBlock from "@/components/docs/CodeBlock";
import Eyebrow from "@/components/ui/Eyebrow";
import { apiPreviewRequest, apiPreviewResponse } from "@/lib/constants";
import { homepageNarrative } from "@/lib/copy/home";

export default function ApiPreviewSection() {
  return (
    <div className="min-w-0 w-full">
      <div className="max-w-2xl">
        <Eyebrow>{homepageNarrative.apiEyebrow}</Eyebrow>
        <h2 className="heading-section mt-4">{homepageNarrative.apiTitle}</h2>
        <p className="mt-4 text-base leading-7 text-[var(--color-gray-300)]">
          {homepageNarrative.apiDescription}
        </p>
      </div>

      <div className="mt-6 grid min-w-0 gap-4">
        <CodeBlock title="Request" code={apiPreviewRequest} />
        <CodeBlock title="Response" code={apiPreviewResponse} />
      </div>

      <Link
        href="/docs"
        className="mt-5 inline-block text-sm text-[var(--color-gray-400)] underline-offset-4 transition hover:text-white hover:underline"
      >
        Full API docs →
      </Link>
    </div>
  );
}
