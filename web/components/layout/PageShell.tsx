import { ReactNode } from "react";

export const MAIN_CONTENT_ID = "main-content";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({
  children,
  className = "",
}: PageShellProps) {
  return (
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className={[
        "flex-1 scroll-mt-24 pb-16 focus:outline-none sm:scroll-mt-28 sm:pb-20 lg:pb-24",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </main>
  );
}
