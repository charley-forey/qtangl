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
      className={`px-6 py-16 sm:px-8 sm:py-20 lg:px-12 ${className}`.trim()}
    >
      <div className={`mx-auto w-full max-w-6xl ${containerClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
}
