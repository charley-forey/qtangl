import Link from "next/link";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
};

type LinkButtonProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> & {
    disabled?: boolean;
    href: string;
  };

type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: never;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

function getClasses(
  variant: Variant,
  size: Size,
  unavailable: boolean,
  className?: string
) {
  const base =
    "touch-target relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition duration-300 focus-visible:outline-none";
  const sizeClass = size === "sm" ? "h-10 px-4 text-sm" : "h-12 px-6 text-sm";
  const variantClass =
    variant === "primary"
      ? unavailable
        ? "bg-neutral-200 text-black/60"
        : "bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_14px_34px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:bg-neutral-100 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_24px_50px_rgba(255,255,255,0.12)]"
      : variant === "secondary"
        ? unavailable
          ? "border border-[var(--border)] bg-transparent text-[var(--color-gray-500)]"
          : "border border-[var(--border)] bg-white/[0.02] text-white hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white/[0.05] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_45px_rgba(255,255,255,0.08)]"
        : unavailable
          ? "text-[var(--color-gray-500)]"
          : "text-[var(--color-gray-300)] hover:text-white";
  const unavailableClass = unavailable ? "cursor-not-allowed opacity-70" : "";

  return [base, sizeClass, variantClass, unavailableClass, className]
    .filter(Boolean)
    .join(" ");
}

export default function Button(props: ButtonProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const busy = props["aria-busy"] === true || props["aria-busy"] === "true";
  const unavailable = Boolean(props.disabled) || busy;
  const className = getClasses(variant, size, unavailable, props.className);

  if ("href" in props && props.href) {
    const { children, disabled, href, tabIndex, ...rest } = props;

    void disabled;

    if (unavailable) {
      return (
        <a
          className={className}
          {...rest}
          role="link"
          aria-busy={busy || undefined}
          aria-disabled={true}
          tabIndex={-1}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={className}
        {...rest}
        aria-busy={busy || undefined}
        tabIndex={tabIndex}
      >
        {children}
      </Link>
    );
  }

  const {
    children,
    className: classNameProp,
    disabled,
    variant: variantProp,
    size: sizeProp,
    ...rest
  } = props as NativeButtonProps;

  void classNameProp;
  void disabled;
  void variantProp;
  void sizeProp;

  return (
    <button
      className={className}
      {...rest}
      disabled={unavailable}
      aria-busy={busy || undefined}
    >
      {children}
    </button>
  );
}
