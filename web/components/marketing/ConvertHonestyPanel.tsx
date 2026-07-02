import Card from "@/components/ui/Card";
import { convertHonestyPanel } from "@/lib/copy/readiness-convert";

export default function ConvertHonestyPanel() {
  return (
    <Card tone="panel" className="p-5 sm:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
            In product today
          </p>
          <ul className="mt-3 space-y-2">
            {convertHonestyPanel.productToday.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-[var(--color-gray-300)]">
                <span className="text-emerald-400" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
            Services / roadmap
          </p>
          <ul className="mt-3 space-y-2">
            {convertHonestyPanel.servicesRoadmap.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-[var(--color-gray-300)]">
                <span className="text-amber-400" aria-hidden>
                  ◷
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
