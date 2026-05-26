type GlowProps = {
  className?: string;
};

export default function Glow({ className = "" }: GlowProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute rounded-full bg-white/25 blur-3xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
