import Image from "next/image";

/** Card grids: 3-col desktop, 2-col tablet, full-width mobile. */
export const CARD_COVER_SIZES = "(min-width: 1280px) 24vw, (min-width: 768px) 42vw, 100vw";

/** Pricing / wide evidence blocks capped around reading width. */
export const WIDE_COVER_SIZES = "(min-width: 768px) 48rem, 100vw";

type CoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Marketing / blog card covers — next/image fill inside a relative aspect-ratio parent.
 */
export default function CoverImage({
  src,
  alt,
  className = "object-cover",
  priority = false,
  sizes = CARD_COVER_SIZES,
}: CoverImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
