import Link from "next/link";
import { ReactNode } from "react";

type FeatureCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  href?: string;
  children?: ReactNode;
};

export default function FeatureCard({
  eyebrow,
  title,
  description,
  href,
  children,
}: FeatureCardProps) {
  const content = (
    <article className="group h-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-transform duration-200 hover:-translate-y-1 hover:border-cyan-400/30">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
      {children ? <div className="mt-5 space-y-3 text-sm text-slate-300">{children}</div> : null}
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
