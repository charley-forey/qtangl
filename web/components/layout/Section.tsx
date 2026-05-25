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
      className={`px-6 py-24 sm:px-8 lg:px-12 lg:py-32 ${className}`.trim()}
    >
      <div className={`mx-auto w-full max-w-7xl ${containerClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
}
