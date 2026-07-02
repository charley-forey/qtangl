import Card from "@/components/ui/Card";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import { monitorPageCopy } from "@/lib/copy/readiness-monitor";

export default function MonitorProofStrip() {
  const { proofItems } = monitorPageCopy;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {proofItems.map((item) => (
        <Card
          key={item.title}
          tone="ghost"
          className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-5 sm:p-6"
        >
          <MarketingIcon name={item.icon} className="h-6 w-6 text-[var(--color-gray-400)]" />
          <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-gray-400)]">{item.description}</p>
        </Card>
      ))}
    </div>
  );
}
