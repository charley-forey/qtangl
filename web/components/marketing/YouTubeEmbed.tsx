type YouTubeEmbedProps = {
  videoId: string;
  title: string;
  caption?: string;
};

export default function YouTubeEmbed({ videoId, title, caption }: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <figure className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black">
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <figcaption className="text-sm text-[var(--color-gray-400)]">
        {caption ?? title}{" "}
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline underline-offset-4"
        >
          Watch on YouTube
        </a>
      </figcaption>
    </figure>
  );
}
