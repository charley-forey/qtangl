import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  className?: string;
  containerClassName?: string;
  gap?: "tight" | "normal" | "loose";
  children: ReactNode;
};

export default function Section({
  id,
  className = "",
  containerClassName = "",
  gap = "normal",
  children,
}: SectionProps) {
  const gapClass =
    gap === "tight" ? "section-shell--tight" : gap === "loose" ? "section-shell--loose" : "";

  return (
    <section
      id={id}
      className={["section-shell", gapClass, className].filter(Boolean).join(" ")}
    >
      <div
        className={`mx-auto w-full max-w-[var(--container-wide)] ${containerClassName}`.trim()}
      >
        {children}
      </div>
    </section>
  );
}
