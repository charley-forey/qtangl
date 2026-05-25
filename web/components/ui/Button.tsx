import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  href?: string;
  target?: string;
  rel?: string;
};

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

function getClasses(variant: Variant, size: Size, className?: string) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition duration-200 focus-visible:outline-none";
  const sizeClass = size === "sm" ? "h-10 px-4 text-sm" : "h-12 px-6 text-sm";
  const variantClass =
    variant === "primary"
      ? "rounded-full bg-white text-black hover:bg-neutral-200"
      : variant === "secondary"
        ? "rounded-full border border-[var(--border)] bg-transparent text-white hover:border-[var(--border-strong)] hover:bg-white/[0.04]"
        : "text-[var(--color-gray-300)] hover:text-white";

  return [base, sizeClass, variantClass, className].filter(Boolean).join(" ");
}

export default function Button(props: ButtonProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const className = getClasses(variant, size, props.className);

  if (props.href) {
    const { children, href, target, rel } = props;

    return (
      <Link href={href} className={className} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  const {
    children,
    className: classNameProp,
    variant: variantProp,
    size: sizeProp,
    href,
    target,
    rel,
    ...rest
  } = props;

  void classNameProp;
  void variantProp;
  void sizeProp;
  void href;
  void target;
  void rel;

  return (
    <button className={className} {...rest}>
      {children}
    </button>
  );
}
