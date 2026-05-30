type DemoRecordingBannerProps = {
  title: string;
  description: string;
  recordingUrl: string;
  scriptHref: string;
};

export default function DemoRecordingBanner({
  title,
  description,
  recordingUrl,
  scriptHref,
}: DemoRecordingBannerProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-gray-400)]">
        Demo recording
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-gray-400)]">{description}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={recordingUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          Watch walkthrough
        </a>
        <a
          href={scriptHref}
          className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-[var(--color-gray-400)] hover:text-white"
        >
          Demo script
        </a>
      </div>
    </div>
  );
}
