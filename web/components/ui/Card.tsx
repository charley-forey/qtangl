import { ReactNode } from "react";

type CardProps = {
  as?: "article" | "div" | "section";
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  strong?: boolean;
};

export default function Card({
  as = "div",
  children,
  className = "",
  interactive = false,
  strong = false,
}: CardProps) {
  const Component = as;

  return (
    <Component
      className={[
        strong ? "surface-panel-strong" : "surface-panel",
        "rounded-xl p-6",
        interactive
          ? "transition duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
