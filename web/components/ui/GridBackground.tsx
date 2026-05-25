type GridBackgroundProps = {
  className?: string;
};

export default function GridBackground({
  className = "",
}: GridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`grid-frame pointer-events-none absolute inset-0 ${className}`.trim()}
    />
  );
}
