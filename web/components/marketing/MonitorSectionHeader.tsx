import Eyebrow from "@/components/ui/Eyebrow";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export default function MonitorSectionHeader({ eyebrow, title, description, className = "" }: Props) {
  return (
    <div className={["content-reading max-w-3xl", className].filter(Boolean).join(" ")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="heading-section mt-3 sm:mt-4">{title}</h2>
      {description ? (
        <p className="mt-3 text-base leading-7 text-[var(--color-gray-300)] sm:mt-4 sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
