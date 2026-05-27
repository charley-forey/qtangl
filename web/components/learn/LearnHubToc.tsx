"use client";

const SECTIONS = [
  { id: "learn-categories", label: "Categories" },
  { id: "learn-flagships", label: "Flagships" },
  { id: "learn-recent", label: "Recently updated" },
  { id: "learn-qtangl", label: "Qtangl lens" },
  { id: "learn-topics", label: "Topic guides" },
  { id: "learn-catalog", label: "Full catalog" },
] as const;

export default function LearnHubToc() {
  return (
    <nav
      aria-label="Learn page sections"
      className="hidden xl:block xl:sticky xl:top-24 xl:self-start"
    >
      <p className="text-label">Jump to</p>
      <ul className="mt-4 space-y-2 text-sm">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-[var(--color-gray-400)] transition hover:text-white"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
