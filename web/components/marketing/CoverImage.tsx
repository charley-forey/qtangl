type CoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Static public covers — plain img avoids next/image SVG hydration quirks. */
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
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
