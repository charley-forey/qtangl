import Link from "next/link";

import { monitorPageCopy } from "@/lib/copy/readiness-monitor";

export default function MonitorIntegrationStrip() {
  const { integrations } = monitorPageCopy;

  return (
    <div>
      <div className="content-reading">
        <p className="text-label">{integrations.eyebrow}</p>
        <h2 className="heading-section mt-4">{integrations.title}</h2>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        {integrations.items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="rounded-xl border border-[var(--border)] bg-black/30 px-5 py-3 text-sm font-medium text-white transition hover:border-[var(--border-strong)] hover:bg-white/5"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
