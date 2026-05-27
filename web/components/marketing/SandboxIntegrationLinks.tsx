import Link from "next/link";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { sandboxIntegrationCopy } from "@/lib/copy/try";

export default function SandboxIntegrationLinks() {
  return (
    <div>
      <Eyebrow>{sandboxIntegrationCopy.eyebrow}</Eyebrow>
      <h2 className="heading-section mt-4">{sandboxIntegrationCopy.title}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sandboxIntegrationCopy.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block focus-visible:outline-none"
          >
            <Card tone="strong" size="md" interactive className="h-full">
              <p className="text-label text-[var(--color-gray-500)]">{link.label}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                {link.description}
              </p>
              <p className="mt-4 text-sm font-medium text-white">{link.cta} →</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
