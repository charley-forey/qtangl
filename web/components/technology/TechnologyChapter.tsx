import Eyebrow from "@/components/ui/Eyebrow";

type TechnologyChapterProps = {
  eyebrow: string;
  title: string;
  className?: string;
};

export default function TechnologyChapter({
  eyebrow,
  title,
  className = "",
}: TechnologyChapterProps) {
  return (
    <div
      className={[
        "content-reading border-t border-[var(--border)] pt-10 md:pt-12",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="heading-section mt-4">{title}</h2>
    </div>
  );
}
