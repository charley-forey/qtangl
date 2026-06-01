import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  accessFormCopy,
  accessMailtoHref,
  accessSuccessCopy,
  getAccessNextSteps,
} from "@/lib/copy/access";
import { siteMetadata } from "@/lib/copy/product";

type AccessSuccessProps = {
  message: string;
  interest?: string;
};

export default function AccessSuccess({ message, interest = "" }: AccessSuccessProps) {
  const nextSteps = getAccessNextSteps(interest);

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <div className="grid gap-6">
        <Eyebrow>{accessSuccessCopy.eyebrow}</Eyebrow>
        <h2 className="heading-section">{accessSuccessCopy.title}</h2>
        <p className="text-base leading-8 text-[var(--color-gray-300)]">{message}</p>
        <p className="text-sm leading-7 text-[var(--color-gray-400)]">
          {accessSuccessCopy.subtitle}
        </p>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/[0.03] p-5">
          <Eyebrow>{accessSuccessCopy.processEyebrow}</Eyebrow>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {accessSuccessCopy.process.map((item) => (
              <li
                key={item.step}
                className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-4"
              >
                <p className="font-mono text-xs text-[var(--color-gray-500)]">Step {item.step}</p>
                <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/[0.03] p-5">
          <Eyebrow>{accessSuccessCopy.exploreEyebrow}</Eyebrow>
          <ul className="mt-4 space-y-3">
            {nextSteps.map((step) => (
              <li key={step.href}>
                <Link
                  href={step.href}
                  className="text-sm text-white underline-offset-4 transition hover:underline"
                >
                  {step.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm leading-7 text-[var(--color-gray-400)]">
          {accessSuccessCopy.urgentPrefix}{" "}
          <a
            href={accessMailtoHref()}
            className="text-white underline-offset-4 transition hover:underline"
          >
            {siteMetadata.contactEmail}
          </a>
        </p>
      </div>
    </Card>
  );
}

export function AccessFormFooter() {
  return (
    <div className="space-y-2 pt-1 text-sm leading-7 text-[var(--color-gray-400)]">
      <p>{accessFormCopy.privacyNote}</p>
      <p>
        {accessFormCopy.mailtoPrefix}{" "}
        <a
          href={accessMailtoHref()}
          className="text-white underline-offset-4 transition hover:underline"
        >
          {siteMetadata.contactEmail}
        </a>
      </p>
    </div>
  );
}
