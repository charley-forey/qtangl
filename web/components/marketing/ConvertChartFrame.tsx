"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Defers chart mount until layout has dimensions — fixes Recharts width(-1) warnings. */
export default function ConvertChartFrame({
  heightClass = "h-44",
  children,
}: {
  heightClass?: string;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className={["w-full min-w-0", heightClass].join(" ")}>
      {ready ? children : <div className="h-full w-full animate-pulse rounded-lg bg-white/[0.04]" />}
    </div>
  );
}
