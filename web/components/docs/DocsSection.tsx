import type { ReactNode } from "react";

type DocsSectionProps = {
  children: ReactNode;
  className?: string;
};

export default function DocsSection({
  children,
  className = "",
}: DocsSectionProps) {
  return (
    <section className={["docs-section space-y-4", className].join(" ")}>
      {children}
    </section>
  );
}
