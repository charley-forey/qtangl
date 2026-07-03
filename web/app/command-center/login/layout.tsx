import type { ReactNode } from "react";

export default function DashboardLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      {children}
    </div>
  );
}
