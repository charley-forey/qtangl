type CoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Blog card covers — in-flow sizing so aspect-ratio parents keep height.
 * (Absolute-only children inside aspect-[4/3] collapse to 0px in grid cards.)
 */
export default function CoverImage({
  src,
  alt,
  className = "object-cover",
  priority = false,
}: CoverImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- public SVG/PNG covers
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`block size-full ${className}`}
    />
  );
}
