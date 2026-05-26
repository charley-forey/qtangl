import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type CardOwnProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  strong?: boolean;
};

type CardProps<T extends ElementType> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

export default function Card<T extends ElementType = "div">({
  as,
  children,
  className = "",
  interactive = false,
  strong = false,
  ...rest
}: CardProps<T>) {
  const Component = as ?? "div";

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
      {...rest}
    >
      {children}
    </Component>
  );
}
