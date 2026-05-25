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
      className={`px-5 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-10 lg:py-28 xl:px-12 xl:py-32 ${className}`.trim()}
    >
      <div
        className={`mx-auto w-full max-w-[var(--container-wide)] ${containerClassName}`.trim()}
      >
        {children}
      </div>
    </section>
  );
}
