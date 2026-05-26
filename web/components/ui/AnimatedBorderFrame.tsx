import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type AnimatedBorderFrameOwnProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
};

type AnimatedBorderFrameProps<T extends ElementType> = AnimatedBorderFrameOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof AnimatedBorderFrameOwnProps<T>>;

export default function AnimatedBorderFrame<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...rest
}: AnimatedBorderFrameProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={["surface-panel-feature", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}
