import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessPageCopy } from "@/lib/copy/access";

export default function AccessTimeline() {
  return (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <Eyebrow>{accessPageCopy.timelineEyebrow}</Eyebrow>
      <ol className="mt-4 space-y-4">
        {accessPageCopy.timeline.map((item) => (
          <li key={item.step} className="flex gap-4">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.04] text-xs font-medium text-white"
            >
              {item.step}
            </span>
            <div>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-1 text-sm leading-7 text-[var(--color-gray-300)]">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
