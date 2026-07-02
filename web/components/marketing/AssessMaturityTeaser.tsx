import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { assessMaturityTeaser } from "@/lib/copy/readiness-assess-demos";

export default function AssessMaturityTeaser() {
  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>{assessMaturityTeaser.eyebrow}</Eyebrow>
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-emerald-300">{assessMaturityTeaser.stage}</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{assessMaturityTeaser.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">{assessMaturityTeaser.description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="#scanner" size="sm">
          Run baseline scan
        </Button>
        <Link href="/journey" className="text-sm text-[var(--color-gray-400)] underline hover:text-white">
          See full maturity model →
        </Link>
      </div>
    </Card>
  );
}
