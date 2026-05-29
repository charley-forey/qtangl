export default function VideoEmbed({ src }: { src: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/40">
      <video className="aspect-video w-full" controls preload="metadata" src={src}>
        <track kind="captions" />
      </video>
    </div>
  );
}
