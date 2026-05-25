import { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

export default function Eyebrow({ children, className = "" }: EyebrowProps) {
  return <p className={`text-label ${className}`.trim()}>{children}</p>;
}
