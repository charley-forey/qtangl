import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
};

export default function Section({
  id,
  className = "",
  containerClassName = "",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`section-shell ${className}`.trim()}
    >
      <div
        className={`mx-auto w-full max-w-[var(--container-wide)] ${containerClassName}`.trim()}
      >
        {children}
      </div>
    </section>
  );
}
