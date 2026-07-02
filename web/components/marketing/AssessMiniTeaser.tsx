import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { assessMiniTeaser } from "@/lib/copy/readiness-assess-demos";

export default function AssessMiniTeaser() {
  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>{assessMiniTeaser.eyebrow}</Eyebrow>
      <h3 className="mt-3 text-lg font-semibold text-white">{assessMiniTeaser.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">{assessMiniTeaser.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button href={assessMiniTeaser.href}>{assessMiniTeaser.cta}</Button>
        <Button href="/assess/mini?scenario=bank" variant="secondary" size="sm">
          Banking preview
        </Button>
        <Button href="/assess/mini?scenario=healthcare" variant="secondary" size="sm">
          Healthcare preview
        </Button>
      </div>
    </Card>
  );
}
