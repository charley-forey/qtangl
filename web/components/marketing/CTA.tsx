import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessPanel } from "@/lib/copy/home";

export default function CTA() {
  return (
    <Card strong className="overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <Eyebrow>{accessPanel.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {accessPanel.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
            {accessPanel.description}
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--color-gray-400)]">
            {accessPanel.formHint}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button href="/access">Request Access</Button>
          <Button href="/docs" variant="secondary">
            Read Documentation
          </Button>
        </div>
      </div>
    </Card>
  );
}
