import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type CardTone = "ghost" | "panel" | "strong" | "feature";
type CardSize = "sm" | "md" | "lg";

type CardOwnProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  strong?: boolean;
  tone?: CardTone;
  size?: CardSize;
};

type CardProps<T extends ElementType> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

export default function Card<T extends ElementType = "div">({
  as,
  children,
  className = "",
  interactive = false,
  strong = false,
  tone,
  size = "md",
  ...rest
}: CardProps<T>) {
  const Component = as ?? "div";
  const resolvedTone = tone ?? (strong ? "strong" : "panel");
  const toneClass =
    resolvedTone === "feature"
      ? "surface-panel-feature"
      : resolvedTone === "strong"
        ? "surface-panel-strong"
        : resolvedTone === "ghost"
          ? "surface-panel-ghost"
          : "surface-panel";
  const sizeClass =
    size === "sm" ? "card-size-sm" : size === "lg" ? "card-size-lg" : "card-size-md";

  return (
    <Component
      className={[
        toneClass,
        sizeClass,
        interactive ? "hover-lift" : "",
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
