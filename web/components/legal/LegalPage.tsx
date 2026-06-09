import Eyebrow from "@/components/ui/Eyebrow";

export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: Array<{ heading: string; body: string }>;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow>Legal</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-2 text-sm text-[var(--color-gray-500)]">Last updated {updated}</p>
      <p className="mt-6 text-sm text-[var(--color-gray-400)]">
        This page summarizes published terms for self-serve accounts. Enterprise customers use executed
        MSA/DPA documents. Counsel review recommended before relying on this text for regulated
        obligations.
      </p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-medium text-white">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-gray-400)]">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
