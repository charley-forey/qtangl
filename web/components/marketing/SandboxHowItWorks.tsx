import Card from "@/components/ui/Card";
import { sandboxHowItWorksCopy } from "@/lib/copy/try";

export default function SandboxHowItWorks() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sandboxHowItWorksCopy.steps.map((step, index) => (
        <Card key={step.title} tone="strong" size="md" className="h-full">
          <p className="text-label text-[var(--color-gray-500)]">Step {index + 1}</p>
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">{step.title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{step.description}</p>
        </Card>
      ))}
    </div>
  );
}
